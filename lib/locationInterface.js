'use strict';
const fetch = require('whatwg-fetch');

const postCodeAPI = 'http://api.postcodes.io/postcodes';


function validatePostcode (postcode){
	postcode = postcode.replace(" ", "");
	const postCodeQuery = `${postCodeAPI}/${postcode}/validate`;

	return fetch(postCodeQuery)
		.then(res => res.json())
		.then(data => {
			return data.result;	
		})
	;
}

function getPostCodeForCoordinates (latitude, longitude){
	
	const lookupQuery = `${postCodeAPI}/postcodes?lat=${latitude}&lon=${longitude}`;
	
	return fetch(lookupQuery)
		.then(res => res.json())
		.then(data => {
			if(data.result === ""){
				return null;
			} else {
				return data.result[0].postcode.replace(' ', '');
			}
		})
	;
	
}

function getGeoCoordinatesForPostcode (postcode){
	
}

function searchForLocation (location){
	
}

module.exports = {
	validate : validatePostcode,
	find : getPostCodeForCoordinates,
	reverse : getGeoCoordinatesForPostcode,
	search : searchForLocation
};