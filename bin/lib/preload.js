const fetch = require('node-fetch');
const debug = require('debug')('api:lib:preload');

const places = require('./places');

module.exports = function(){

	if(process.env.PORT && process.env.PRELOAD){

		const delay = 1800;

		places.forEach( (place, idx) => {

			setTimeout(function(){
				debug(`Caching results for ${place}`);
				fetch(`http://localhost:${process.env.PORT}/search/cinemas/location/${place}`)
					.then(res => res.json())
					.then(data => {
						
						debug(data);

						if(data.cinemas){
							data.cinemas.forEach(cinema => {
								fetch(`http://localhost:${process.env.PORT}/get/times/cinema/${cinema.id}`)
							});
						}

					})
				;

			}, delay * idx);

		});
		
	}

}