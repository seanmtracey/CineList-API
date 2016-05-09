'use strict';

const fetch = require('node-fetch');
const debug = require('debug')('api:lib:fafScraper');

const cheerio = require('cheerio');

const fafAPI = "http://www.findanyfilm.com"

function getCinemasForPostcode(postcode){
	
	const fafURL = `${fafAPI}/find-cinema-tickets?townpostcode=${postcode}`;
	
	debug(fafURL);
	
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
			
			const cinemas = cinemaList.map(cinema => {
				
				const name = cheerio(cinema).find('span').text();
				const id = cinema.attribs.rel.replace('#cinemaInfo', '');
				const distance = parseFloat(cinema.children[1].data.replace(' miles', ''));
				
				if(distance < 15){	
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
	
	day = day || 0;
	
	const fafURL = `${fafAPI}/api/screenings/by_venue_id/venue_id/${id}/date_from/${day}`;
	debug(fafURL);
	
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
				})
				
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
