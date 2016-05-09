'use strict';
const fetch = require('node-fetch');
const debug = require('debug')('api:lib:locationInterface');

const postCodeAPI = 'http://api.postcodes.io/postcodes';
const nominatimAPI = 'http://nominatim.openstreetmap.org';

function validatePostcode (postcode){
	postcode = postcode.replace(" ", "");
	const postCodeQuery = `${postCodeAPI}/${postcode}/validate`;
	
	debug(postCodeQuery);
	
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
	
	const lat = latitude.substring(0, 9);
	const lon = longitude.substring(0, 9);
	
	const lookupQuery = `${postCodeAPI}/?lon=${lon}&lat=${lat}`;
	
	debug(lookupQuery);
	
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
	
	const nominatimQuery = `${nominatimAPI}/search?q=${location}&countrycodes=gb&format=json&limit=10`;
	
	debug(nominatimQuery);
	
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