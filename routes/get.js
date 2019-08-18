'use strict';

const express = require('express');
const router = express.Router();
const debug = require('debug')('api:routes:get');

const FaF = require('../bin/lib/fafScraper');

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

	const venueIDs = Array.from( new Set( req.params.venueIDs.split(',') ) );
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

router.get('/cinema/:venueID',function(req,res){
	const venueID = req.params.venueID;
  	return FaF.getCinema(venueID)
    		.then(cinemaData => {
      			return res.json(cinemaData);
    		})
    		.catch(err => {
      			debug("An error occurred",err);
      			res.status(500);
      			res.json({
        			status: "ERR",
        			reason: err
      			});
    		})
	;
});

module.exports = router;
