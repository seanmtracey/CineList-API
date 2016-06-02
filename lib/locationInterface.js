'use strict';
const fetch = require('node-fetch');
const debug = require('debug')('api:lib:locationInterface');

const postCodeAPI = 'http://api.postcodes.io/postcodes';
const nominatimAPI = 'http://nominatim.openstreetmap.org';

function validatePostcode (postcode){
	
	if(postcode === undefined || postcode === "" || postcode === null){
		debug("validatePostcode: Request was rejected", postcode);
		return new Promise.reject("A postcode was not passed to the function");
	}
	
	postcode = postcode.replace(" ", "");
	const postCodeQuery = `${postCodeAPI}/${postcode}/validate`;
	
	return fetch(postCodeQuery)
		.then(res => res.json())
		.then(data => {
			
			debug(data);
			
			if(data.result !== undefined){
				return data.result;
			} else {
				throw data;
			}
			
		})
	;
}

function getPostCodeForCoordinates (latitude, longitude){
	
	if(latitude === undefined || latitude === "" || latitude === null || longitude === undefined || longitude === "" || longitude === null){
		debug("getPostCodeForCoordinates: Request was rejected", latitude, longitude);
		return new Promise.reject("Either a latitude or longitude value was omitted. Both are required");
	}
	
	const lat = latitude.substring(0, 9);
	const lon = longitude.substring(0, 9);
	
	const lookupQuery = `${postCodeAPI}/?lon=${lon}&lat=${lat}`;

	return fetch(lookupQuery)
		.then(res => res.json())
		.then(data => {
			
			debug(data);
			
			if(data.result === ""){
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
		return new Promise.reject("A location was not passed to the function");
	}
	
	const nominatimQuery = `${nominatimAPI}/search?q=${location}&countrycodes=gb&format=json&limit=10`;
	
	return fetch(nominatimQuery)
		.then(res => res.json())
		.then(data => {
			
			debug(data);

			if(data.length > 0){
				return getPostCodeForCoordinates(data[0].lat.substring(0, 5), data[0].lon.substring(0, 5));
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