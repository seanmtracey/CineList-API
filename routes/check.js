'use strict';

const express = require('express');
const router = express.Router();
const debug = require('debug')('api:routes:check');

const locationInterface = require('../bin/lib/locationInterface');
const faf = require('../bin/lib/fafScraper');

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

router.get('/isUp', function (req,res){
    faf.isUp()
        .then(retVal => {
            res.json({
                "fafSite": retVal
            });
        })
        .catch(err => {
            res.json({
                "fafSite": false
            })
        });
});

module.exports = router;
