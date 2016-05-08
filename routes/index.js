var express = require('express');
var router = express.Router();

const locationInterface = require('../lib/locationInterface');
const FaF = require('../lib/fafScraper');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search/cinemas/postcode/:postcode', function(req, res){
	
	const isValidPostCode = locationInterface.validate( req.params.postcode )
		.then(isValid => {
			
			if(isValid){
				// Check for cinemas;
				console.log("Was valid");
				
				
				
				res.end();
			} else {
				res.status(500);
				res.json({
					"status" : "ERR",
					"reason" : "Invalid postcode."
				});
			}
				
		})
		.catch(err => {
			console.log("An error occurred:", err);
			res.status(500);
			res.json({
				"status" : "ERR",
				"reason" : "Sorry, something went wrong."
			})
		})
	;
	
});

router.get('/search/cinemas/coordinates/:latitude/:longitude', function(req, res){
	
	locationInterface.find(req.params.latitude, req.params.longitude)
		.then(data => {
			console.log(data);	
		})
		.catch(err => {
			console.log(err);
		})
	;
	
	res.end();
	
});

module.exports = router;
