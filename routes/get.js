'use strict';

const express = require('express');
const router = express.Router();
const debug = require('debug')('api:routes:get');

const locationInterface = require('../lib/locationInterface');
const FaF = require('../lib/fafScraper');

router.get('/times/cinema/:venueID', function(req, res){
	
	const venueID = req.params.venueID;
	const dayOffset = req.query.day;
	
	FaF.getListings(venueID, dayOffset)
		.then(listings => {
			
			debug(listings);
			
			res.json({
				status : "ok",
				listings
			})
			
		})
		.catch(err => {
			debug("An error occurred whilst getting times for a cinema:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : err
			});
		})
	;

});

router.get('/times/many/:venueIDs', function(req, res){

	const venueIDs = req.params.venueIDs.split(',');
	const dayOffset = req.query.day;

	const times = venueIDs.map(venueID => {

		return FaF.getListings(venueID, dayOffset)
			.then(listings => {
				return {
					cinema : venueID,
					listings
				}
			})
			.catch(err => {
				return null;
			})
		;

	});

	Promise.all(times)
		.then(ts => {
			res.json({
				status : "ok",
				results : ts
			})
		})
	;
	
});

module.exports = router;
