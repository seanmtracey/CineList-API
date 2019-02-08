'use strict';

const fetch = require('node-fetch');
const debug = require('debug')('api:lib:fafScraper');
const LRU = require("lru-cache");

const moment = require('moment');
const cheerio = require('cheerio');

const offsetToDatestamp = require('./day-offset-to-datestamp');
const halflife = require('./half-life');

const cache = LRU({
	length: function (n, key) { return n * 2 + key.length },
	maxAge: halflife()
});

const fafAPI = "http://www.findanyfilm.com"

function getCinemaByID(id)
{
  const fafURL = `${fafAPI}/api/screenings/by_venue_id/venue_id/${id}`;
  if(id === undefined || id === "" || id === "0")
  {
    debug("getCinemaData: Request was rejected",id);
    return Promise.reject("A cinema ID was not passed to the function");
  }

  const cachedVersion = cache.get(`cinemaInfo:${id}`);
  debug(`Is there cached cinema with ID ${id}?`, cachedVersion !== undefined);

  if(cachedVersion)
  {
    const parsedCacheVersion = JSON.parse(cachedVersion);
    debug(`Returning cached cinema data for ID ${id}`,parsedCacheVersion);
    return Promise.resolve(parsedCacheVersion);
  }
  else
  {
    return fetch(fafURL)
    .then(res => {
      return res.json();
    })
    .then(json =>{
      delete json[id].films;
      const cinema = json[id];
      cache.set(`cinemaInfo:${id}`, JSON.stringify({
        state: 'resolved',
        cinema
      }));

      return cinema;
    })
    .catch(err => {
      debug("An error occurred while fetching cinema data"),err;;
      throw "An error occurred while fetching cinema data, the cinema may not exist";
    });
  }
}

function getCinemasForPostcode(postcode, attempt){
	
	attempt = attempt || 0;

	const fafURL = `${fafAPI}/find-cinema-tickets?townpostcode=${postcode}`;
	
	if(postcode === undefined || postcode === "" || postcode === null){
		debug("getCinemasForPostcode: Request was rejected", postcode);
		return Promise.reject("A postcode was not passed to the function");
	}

	const cachedVersion = cache.get(`cinemaLocations:${postcode}`);
	debug(`Is there a cached list of cinemas for ${postcode}?`, cachedVersion !== undefined);
	
	if(cachedVersion){

		const parsedCacheVersion = JSON.parse(cachedVersion);
		debug(`Returning cached list of cinemas for ${postcode}`, parsedCacheVersion.cinemas);
		return Promise.resolve(parsedCacheVersion.cinemas);

	} else {

		return fetch(fafURL)
			.then(res => {
				return res.text();	
			})
			.then(html => {
				const parsedHTML = cheerio.load(html,{
					normalizeWhitespace: true,
					xmlMode: true
				});
				
				const cinemaList = Array.from(parsedHTML('ul.cinemas-listings li.cinemaResult'));

				if(cinemaList.length === 0 && attempt < 2){ 
					debug("There were no cinemas for that postcode. Retrying with truncated postcode");
					return getCinemasForPostcode(postcode.split(' ')[0], attempt += 1);
				}

				const cinemas = cinemaList.map(cinema => {
					
					const name = cheerio(cinema).find('span').text();
					const id = cinema.attribs.rel.replace('#cinemaInfo', '');
					const distance = parseFloat(cinema.children[1].data.replace(' miles', ''));
					
					if(distance < 20){
						return {
							name,
							id,
							distance
						};
					}
					
				}).filter(result => {
					return result === undefined ? false : true;
				})
				
				debug(cinemas);

				cache.set(`cinemaLocations:${postcode}`, JSON.stringify({
					state : 'resolved',
					cinemas
				}));
				
				return cinemas;
				
			})
		;

	}
	
}

function getListingForCinemaByID(id, day){
	
	if(id === undefined || id === "" || id === null){
		debug("getListingForCinemaByID: Request was rejected", id);
		return Promise.reject("A cinema id was not passed");
	}
	
	day = day || 0;
	const cachedVersion = cache.get(`listings:${id}:${day}`);

	debug(`Is there a cached version of ${id}?`, cachedVersion !== undefined);
	debug(cachedVersion);
	if(cachedVersion){

		const parsedCacheVersion = JSON.parse(cachedVersion);
		const today = moment(new Date() / 1000);
		const cacheTime = moment(parsedCacheVersion.time);
		debug(parsedCacheVersion);

		if(parsedCacheVersion.state === "invalid"){
			debug("INVALID cinema ID. Rejecting...");
			return Promise.reject("Not a valid cinema ID");
		} else if(parsedCacheVersion.state === 'unresolved'){
			debug("Item is in cache, but unresolved... waiting...");
			return new Promise(function(resolve){
				setTimeout(function(){
					console.log("Wait time elapsed");
					resolve();
				}, 3000);
			}).then(function(){
				return getListingForCinemaByID(id, day);
			});
		
		} else if( today.startOf('day').isSame(cacheTime.startOf('day')) ){
			debug("Using cached version");
			debug(parsedCacheVersion.listings);
			return Promise.resolve(parsedCacheVersion.listings);
		}

	} else {
		cache.set(`${id}:${day}`, JSON.stringify({
			state : 'unresolved',
			maxAge : 1000 * 10
		}));
	}

	const fafURL = `${fafAPI}/api/screenings/by_venue_id/venue_id/${id}/date_from/${offsetToDatestamp( day )}`;

	debug(`fafURL >>>`, fafURL);

	return fetch(fafURL)
		.then(res => {
			return res.json();
		})
		.then(data => {

			if(!data){

				cache.set(`listings:${id}:${day}`, JSON.stringify({
					state : 'invalid',
					maxAge : (1000 * 60 * 60) * 72
				}));

				throw "Not a valid cinema ID";
			}

			const listings = Object.keys(data[id]["films"]).map(filmID => {
				
				const film = data[id]["films"][filmID];
				const title = film["film_data"]["film_title"];
				const times = film.showings.map(showing => {
					return showing["display_showtime"];
				}).filter(times => {
					return times === undefined ? false : true;
				}) || [];
				
				if(title !== undefined){
					return {
						title,
						times
					};	
				}
					
			}).filter(listing => {
				return listing === undefined ? false : true;
			});
			
			let listingsToCache = {
				state : 'resolved',
				time : moment().add(day,'days').unix(),
				listings
			};

			cache.set(`listings:${id}:${day}`, JSON.stringify( listingsToCache ) );

			return listings;

		})
	;
	
}

module.exports = {
	getCinemas : getCinemasForPostcode,
	getListings : getListingForCinemaByID,
  getCinema : getCinemaByID
};
