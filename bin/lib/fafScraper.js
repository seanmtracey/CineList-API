'use strict';

const fetch = require('node-fetch');
const debug = require('debug')('api:lib:fafScraper');
const LRU = require("lru-cache");

const moment = require('moment');
const cheerio = require('cheerio');
const cache = LRU({
	max: 500,
	length: function (n, key) { return n * 2 + key.length },
	maxAge: (1000 * 60 * 60) * 24
});

const fafAPI = "http://www.findanyfilm.com"

function getCinemasForPostcode(postcode, attempt){
	
	attempt = attempt || 0;

	const fafURL = `${fafAPI}/find-cinema-tickets?townpostcode=${postcode}`;
	
	if(postcode === undefined || postcode === "" || postcode === null){
		debug("getCinemasForPostcode: Request was rejected", postcode);
		return new Promise.reject("A postcode was not passed to the function");
	}
	
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
			
			return cinemas;
			
		})
	;
	
}

function getListingForCinemaByID(id, day){
	
	if(id === undefined || id === "" || id === null){
		debug("getListingForCinemaByID: Request was rejected", id);
		return new Promise.reject("A cinema id was not passed");
	}
	
	day = day || 0;
	const cachedVersion = cache.get(`${id}:${day}`);

	debug(`Is there a cached version of ${id}?`, cachedVersion !== undefined);

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

	const fafURL = `${fafAPI}/api/screenings/by_venue_id/venue_id/${id}/date_from/${day}`;
	
	return fetch(fafURL)
		.then(res => {
			return res.json();
		})
		.then(data => {

			if(!data){

				cache.set(`${id}:${day}`, JSON.stringify({
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

			cache.set(`${id}:${day}`, JSON.stringify( listingsToCache ) );

			return listings;

		})
	;
	
}

module.exports = {
	getCinemas : getCinemasForPostcode,
	getListings : getListingForCinemaByID
};
