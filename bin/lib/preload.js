const fetch = require('node-fetch');
const debug = require('debug')('api:lib:preload');

const places = require('./places');

module.exports = function(){

	let timeOffset = 0;
	const increment = 1800;

	places.forEach(place => {

		setTimeout(function(){
			debug(`Caching results for ${place}`);
			fetch(`http://localhost:${process.env.PORT}/search/cinemas/location/${place}`)
				.then(res => res.json())
				.then(data => {
					debug(data);
					data.cinemas.forEach(cinema => {
						fetch(`${process.env.HOSTNAME}/get/times/cinema/${cinema.id}`)
					});

				})
			;

		}, timeOffset);

		timeOffset += increment;

	});

}