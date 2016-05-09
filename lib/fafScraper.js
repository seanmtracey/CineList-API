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

module.exports = {
	getCinemas : getCinemasForPostcode
};
