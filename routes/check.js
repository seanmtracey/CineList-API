'use strict';

const express = require('express');
const router = express.Router();
const debug = require('debug')('api:lib:index');

const locationInterface = require('../lib/locationInterface');

router.get('/isPostcode/:postcode', function(req, res){

	locationInterface.validate( req.params.postcode )
		.then(isValid => {

			if(isValid){
				res.json({
					validPostcode : true
				});
			} else {
				res.json({
					validPostcode : false
				});
			}

		})
		.catch(err => {
			debug("An error occurred while validating a postcode:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			});
		})
	;
	
});

module.exports = router;
