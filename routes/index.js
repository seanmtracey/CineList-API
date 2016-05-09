'use strict';

var express = require('express');
var router = express.Router();
const debug = require('debug')('api:lib:index');

const locationInterface = require('../lib/locationInterface');
const FaF = require('../lib/fafScraper');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/////////////////////////////////////////////
//
// Endpoints for finding cinemas
//
/////////////////////////////////////////////

router.get('/search/cinemas/postcode/:postcode', function(req, res){
	
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
			debug("An error occurred:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			})
		})
	;
	
});

router.get('/search/cinemas/coordinates/:latitude/:longitude', function(req, res){
	
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
			debug("An error occurred:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;
	
});

router.get('/search/cinemas/location/:location', function(req, res){
	
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
			debug("An error occurred:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;
	
});

/////////////////////////////////////////////
//
// Endpoints for getting cinema times
//
/////////////////////////////////////////////

router.get('/get/times/cinema/:venueID', function(req, res){
	
	const venueID = req.params.venueID;
	
	FaF.getListings(venueID)
		.then(listings => {
			
			debug(listings);
			
			res.json({
				status : "ok",
				listings
			})
			
		})
		.catch(err => {
			debug("An error occurred:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;
	
});

module.exports = router;
