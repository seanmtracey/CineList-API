'use strict';
const fetch = require('node-fetch');
const debug = require('debug')('api:lib:locationInterface');
const LRU = require("lru-cache");

const halflife = require('./half-life');

const postCodeAPI = 'http://api.postcodes.io/postcodes';
const nominatimAPI = 'http://nominatim.openstreetmap.org';
const cache = LRU({
	length: function (n, key) { return n * 2 + key.length }
});

function validatePostcode (postcode){
	
	if(postcode === undefined || postcode === "" || postcode === null){
		debug("validatePostcode: Request was rejected", postcode);
		return Promise.reject("A postcode was not passed to the function");
	}
	
	postcode = postcode.replace(" ", "");
	const postCodeQuery = `${postCodeAPI}/${postcode}/validate`;
	
	const cachedVersion = cache.get(`validate-postcode:${postcode}`);
	debug(`Is there cached information about the postcode ${postcode}?`, cachedVersion !== undefined);

	if(cachedVersion){

		const parsedCacheVersion = JSON.parse(cachedVersion);
		debug(`Returning cached postcode results for ${postcode}`)
		return Promise.resolve(parsedCacheVersion.data);

	} else {

		return fetch(postCodeQuery)
			.then(res => res.json())
			.then(data => {
				
				debug(data);
				
				if(data.result !== undefined){

					cache.set(`validate-postcode:${postcode}`, JSON.stringify({
						state : 'resolved',
						data : data.result
					}), halflife());

					return data.result;
				} else {
					throw data;
				}
				
			})
		;

	}

}

function getPostCodeForCoordinates (latitude, longitude){
	
	if(latitude === undefined || latitude === "" || latitude === null || longitude === undefined || longitude === "" || longitude === null){
		debug("getPostCodeForCoordinates: Request was rejected", latitude, longitude);
		return Promise.reject("Either a latitude or longitude value was omitted. Both are required");
	}
	
	const lat = latitude.substring(0, 9);
	const lon = longitude.substring(0, 9);	
	debug(`Getting post code for coordinates latitude: ${lat} longitude: ${lon}`);

	const lookupQuery = `${postCodeAPI}/?lon=${lon}&lat=${lat}`;

	debug(lookupQuery);

	return fetch(lookupQuery)
		.then(res => res.json())
		.then(data => {
			
			debug(data);
			
			if(data.result === "" || !data.result){
				throw data;
			} else {
				return data.result[0].postcode.replace(' ', '');
			}
		})
	;
	
}

function searchForLocation (location){
	
	if(location === undefined || location === "" || location === null){
		debug("searchForLocation: Request was rejected", location);
		return Promise.reject("A location was not passed to the function");
	}
	
	const nominatimQuery = `${nominatimAPI}/search?q=${location}&countrycodes=gb&format=json&limit=10`;

	const cachedVersion = cache.get(`nominatim-search:${location}`);
	debug(`Is there cached Nominatim information about the location ${location}?`, cachedVersion !== undefined);

	if(cachedVersion){
		const parsedCacheVersion = JSON.parse(cachedVersion);
		debug(`Returning cached location information for ${location}`);
		return Promise.resolve(parsedCacheVersion.data);
	}

	return fetch(nominatimQuery)
		.then(res => res.json())
		.then(data => {
			
			debug(data);

			if(data.length > 0){
				return getPostCodeForCoordinates(data[0].lat, data[0].lon)
					.then(data => {

						cache.set(`nominatim-search:${location}`, JSON.stringify({
							state : 'resolved',
							data
						}), halflife());

						return data;

					})
				;
			} else {
				throw data;					
			}
			
		})
	;
	
}

module.exports = {
	validate : validatePostcode,
	find : getPostCodeForCoordinates,
	search : searchForLocation
};