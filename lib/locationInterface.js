'use strict';
const fetch = require('node-fetch');

const postCodeAPI = 'http://api.postcodes.io/postcodes';
const nominatimAPI = 'http://nominatim.openstreetmap.org';

function validatePostcode (postcode){
	postcode = postcode.replace(" ", "");
	const postCodeQuery = `${postCodeAPI}/${postcode}/validate`;
	
	console.log("Got to Validate", postCodeQuery);
	
	return fetch(postCodeQuery)
		.then(res => res.json())
		.then(data => {
			
			console.log(data);
			
			if(data.result !== undefined){
				return data.result;
			} else {
				throw data;
			}
			
		})
	;
}

function getPostCodeForCoordinates (latitude, longitude){
	
	const lat = latitude.substring(0, 8);
	const lon = longitude.substring(0, 8);
	
	const lookupQuery = `${postCodeAPI}/postcodes?lat=${lat}&lon=${lon}`;
	
	console.log(lookupQuery);
	
	return fetch(lookupQuery)
		.then(res => res.json())
		.then(data => {
			
			console.log(data);
			
			if(data.result === ""){
				return null;
			} else {
				return data.result[0].postcode.replace(' ', '');
			}
		})
	;
	
}

function searchForLocation (location){
	
	const nominatimQuery = `${nominatimAPI}/search?q=${location}&countrycodes=gb&format=json&limit=10`;
	return fetch(nominatimQuery)
		.then(res => res.json())
		.then(data => {
			
			let place = undefined;
			let postcode = undefined;
			
			if(data.length > 0){
				place = data[0];
				return postcode = getPostcode(place.lat.substring(0, 5), place.lon.substring(0, 5));
			}
			
			return null;
				
		})
	;
	
}

module.exports = {
	validate : validatePostcode,
	find : getPostCodeForCoordinates,
	search : searchForLocation
};