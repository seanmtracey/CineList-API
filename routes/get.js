'use strict';

const express = require('express');
const router = express.Router();
const debug = require('debug')('api:lib:index');

const locationInterface = require('../lib/locationInterface');
const FaF = require('../lib/fafScraper');

router.get('/times/cinema/:venueID', function(req, res){
	
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
			debug("An error occurred whilst getting times for a known cinema:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;

});

module.exports = router;
