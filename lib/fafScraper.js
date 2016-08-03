'use strict';

const fetch = require('node-fetch');
const debug = require('debug')('api:lib:fafScraper');

const cheerio = require('cheerio');

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
	
	const fafURL = `${fafAPI}/api/screenings/by_venue_id/venue_id/${id}/date_from/${day}`;
	
	return fetch(fafURL)
		.then(res => {
			return res.json();
		})
		.then(data => {
		
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
		
			return listings;

		})
	;
	
}

module.exports = {
	getCinemas : getCinemasForPostcode,
	getListings : getListingForCinemaByID
};
