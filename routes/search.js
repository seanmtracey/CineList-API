'use strict';

const express = require('express');
const router = express.Router();
const debug = require('debug')('api:routes:search');

const locationInterface = require('../lib/locationInterface');
const FaF = require('../lib/fafScraper');

router.get('/cinemas/postcode/:postcode', function(req, res){
	
	locationInterface.validate( req.params.postcode )
		.then(isValid => {
			
			if(isValid){
				// Check for cinemas;
				debug("Was valid");
				return req.params.postcode;
				
			} else {
				res.status(500);
				res.json({
					"status" : "ERR",
					"reason" : "Invalid postcode."
				});
			}
				
		})
		.then(validatedPostcode => {
			return FaF.getCinemas(validatedPostcode);
		})
		.then(cinemas => {
			
			res.send({
				"postcode" : req.params.postcode,
				cinemas
			});
	
		})
		.catch(err => {
			debug("An error occurred while searching for cinemas by postcode:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			})
		})
	;
	
});

router.get('/cinemas/coordinates/:latitude/:longitude', function(req, res){
	
	let resolvedPostcode = undefined;
	
	locationInterface.find(req.params.latitude, req.params.longitude)
		.then(postcode => {
			resolvedPostcode = postcode;
			return FaF.getCinemas(postcode);
		})
		.then(cinemas => {
			res.send({
				"postcode" : resolvedPostcode,
				cinemas
			});
		})
		.catch(err => {
			debug("An error occurred while searching for cinemas by geocoordinates:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;
	
});

router.get('/cinemas/location/:location', function(req, res){
	
	let resolvedPostcode = undefined;
	
	debug(req.params.location);
	
	locationInterface.search(req.params.location)
		.then(postcode => {
			resolvedPostcode = postcode;
			return FaF.getCinemas(postcode);
		})
		.then(cinemas => {
			res.send({
				"postcode" : resolvedPostcode,
				cinemas
			});
		})
		.catch(err => {
			debug("An error occurred while searching for a cinema by location:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;
	
});

module.exports = router;
