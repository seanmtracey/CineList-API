var __cinelist = (function(){

	'use strict';

	var initialised = false,
		locationInput = undefined,
		filterInput = undefined,
		selectedPlace = undefined,
		showTimesResults = undefined;

	var startTime = undefined,
		endTime = undefined;

	function isWindows(cb){

		if (navigator.appVersion.indexOf("Win") != -1){
			cb();
		}

	}

	var loading = (function(){

		var el = document.getElementById('loading');

		function displayLoading(){
			el.setAttribute('class', 'spin');
			el.setAttribute('data-is-loading', 'true');
		}

		function hideLoading(){
			el.setAttribute('class', '');
			el.setAttribute('data-is-loading', 'false');
		}

		return{
			display : displayLoading,
			hide : hideLoading
		};

	})();

	var dialog = (function(){

		var el = document.getElementById('dialog');

		function displayDialog(message, isError){

			el.textContent = message;

			if(isError){
				el.setAttribute('class', 'error');
			} else {
				el.setAttribute('class', '');
			}

		}

		function hideDialog(time){
			
			setTimeout(function(){
				el.setAttribute('class', 'inactive');
				el.textContent = "";
			}, time);
			

		}

		function handleError(message){
			displayDialog(message, true);
			hideDialog(3000);
		}

		return{
			display : displayDialog,
			hide : hideDialog,
			error : handleError
		};

	})();

	function displayListings(listings){

		console.log(listings);

		// endTime = performance.now();

		// console.log("Search took %f ms", endTime - startTime);

		//Organise Listings by distance

		var listings = listings;

		listings.sort(function(a,b){

			var disA = parseFloat(a.cinema.distance),
				disB = parseFloat(b.cinema.distance);

			if(disA < disB){
				return -1;
			} else {
				return 1;
			}

		});

		console.log(listings);

		document.getElementById('results').innerHTML = "";

		var cineFrag = document.createDocumentFragment();

		var d = new Date(),
			thisHour = d.getHours(),
			thisMinute = d.getMinutes();

		for(var x = 0; x < listings.length; x += 1){

			var thisCinemaData = listings[x];

			var cinemaName = document.createElement('h1'),
				results = document.createElement('ul');
				
				cinemaName.textContent = thisCinemaData.cinema.title;

				if(thisCinemaData.times.length === 0){
					continue;
				}

				cineFrag.appendChild(cinemaName);

			for(var g = 0; g < thisCinemaData.times.length; g += 1){

				var	movieHolder = document.createElement('li'),
					movieTitle = document.createElement('h3'),
					timesHolder = document.createElement('div');

				if(thisCinemaData.times[g].title.length > 30){
					var shortened = thisCinemaData.times[g].title.slice(0, 29);
					movieTitle.setAttribute('class','shortened');
					movieTitle.textContent = shortened + "...";
				} else {
					movieTitle.textContent = thisCinemaData.times[g].title;	
				}

				movieHolder.setAttribute('data-movie-title', thisCinemaData.times[g].title);
				
				timesHolder.setAttribute('class', 'times');

				var setNext = false;

				for(var j = 0; j < thisCinemaData.times[g].time.length; j += 1){

					var aTime = document.createElement('a'),
						theTime = thisCinemaData.times[g].time[j].split(":"),
						canCatch = undefined;

					aTime.textContent = theTime.join(":");

					if(thisHour < parseInt(theTime[0])){
						canCatch = true
					} else if(thisHour == parseInt(theTime[0]) && thisMinute < parseInt(theTime[1])){
						canCatch = true;
					} else {
						canCatch = false;
					}

					if(!setNext && canCatch){
						aTime.setAttribute('class', 'next')
						setNext = true;
					}

					if(!canCatch){
						aTime.setAttribute('class','missed');
					}

					if(j === thisCinemaData.times[g].time.length - 1 && !setNext){
						movieHolder.setAttribute('data-all-missed', 'true');
					}

					timesHolder.appendChild(aTime);

				}

				movieHolder.appendChild(movieTitle);
				movieHolder.appendChild(timesHolder);

				results.appendChild(movieHolder);
				cineFrag.appendChild(results);

				document.getElementById('results').appendChild(cineFrag);

				//document.body.appendChild(cineFrag);

			}

			filterResults.setAttribute('class', '');
			filterResults.reset();

			setTimeout(function(){
				document.getElementById('goArrow').setAttribute('class', 'inactive');
			}, 10);

		}

	}

	function listShowtimes(cinemaID, callback){
		//http://162.243.202.96:9191/echo/cinematimes/7174

		console.log(cinemaID);

		var getListingsURL = "http://cinelist.co.uk/echo/cinematimes/" + cinemaID;

		jQuery.ajax({
			type : "GET",
			url : getListingsURL,
			success : callback,
			error : function(err){
				console.log(err);
				loading.hide();
				dialog.error("Sorry, something went wrong");
			},
			dataType : "json",
			crossDomain : true,
			cache : false
		});

	}	

	function searchCinemas(postcode, callback){

		var earl = "http://cinelist.co.uk/echo/searchcinema/" + encodeURIComponent(postcode)

		console.log(earl);

		jQuery.ajax({
			type : "GET",
			url : earl,
			success : callback,
			error : function(err){
				console.log(err);
				loading.hide();
				dialog.error("Sorry, Something went wrong");
			},
			dataType : "json",
			crossDomain : true,
			cache : false
		});

	}

	function searchPostCode(lat, lon, callback){

		console.log(lat, lon);

		lat = lat.toFixed(3);
		lon = lon.toFixed(3);

		var postCodeQuery = "http://api.postcodes.io/postcodes?lon=" + lon + "&lat=" + lat;

		console.log(postCodeQuery);

		jQuery.ajax({
			type : "GET",
			url : postCodeQuery,
			success : callback,
			error : function(err){
				console.log(err);
				loading.hide();
				dialog.error("Sorry, Something went wrong");
			}
		});

	}

	function searchTowns(town, callback){

		console.log(town);

		var reqQuery = "http://nominatim.openstreetmap.org/search?q=" + town + "&countrycodes=gb&format=json&limit=10";

		console.log(reqQuery);

		jQuery.ajax({
			type : "GET",
			url : reqQuery,
			success : callback,
			cache: false,
			error : function(err){
				console.error(err);
				loading.hide();
				dialog.error("Sorry, Something went wrong");
			}
		});

	}

	var lastPress = 0,
		filterInterval = undefined,
		lastSearch = undefined;

	function filterExistingResults(){

		clearTimeout(filterInterval);

			var filterables = document.querySelectorAll('[data-movie-title]'),
				filterTerm = filterResults[0].value.toLowerCase();

			if(filterTerm !== lastSearch){
				for(var i = 0; i < filterables.length; i += 1){
					filterables[i].setAttribute('class', '');
				}	
			}

			lastSearch = filterTerm

			filterInterval = setTimeout(function(){

				//Do the filter thing

				console.log(filterables);

				for(var h = 0; h < filterables.length; h += 1){

					if(filterables[h].getAttribute('data-movie-title').toLowerCase().indexOf(filterTerm) == -1){
						filterables[h].setAttribute('class', 'dim');
					} else if(filterTerm.length > 0){
						filterables[h].setAttribute('class', 'highlight');
					}

				}

			}, 300);

	}

	function addEvents(){

		locationInput.addEventListener('submit', function(e){
			e.preventDefault();
			locationInput[0].blur();
			// startTime = performance.now();

			loading.display();
			dialog.hide(0);
			document.getElementById('results').innerHTML = "";
			// document.getElementById('goArrow').setAttribute('class', 'inactive');

			document.getElementById('helper').setAttribute('class', 'inactive');

			var searchQuery = this[0].value;

			searchTowns(searchQuery, function(res){

				console.log(res);

				if(res.length === 0){
					console.error("Not a valid place name");
					loading.hide();
					dialog.error("Sorry, couldn't find that place");
					// dialog.hide(3000);
					return false;
				}

				var selectedTown = res[0];

				searchPostCode(selectedTown.lat, selectedTown.lon, function(res){

					console.log(res);

					if(res.result === null){
						console.error("This place doesn't have a UK postcode.");
						loading.hide();
						dialog.error("Could not find a UK postcode for this place...");
						// dialog.hide(3000);
						locationInput[0].focus();
						return false;
					}

					if(res.result.length > 0){

						var postcode = res.result[0].postcode;

						selectedPlace = postcode;

						console.log(postcode);

						searchCinemas(postcode, function(res){

							var cinemas;

							try{
								cinemas = JSON.parse(res.data)
							} catch(err){
								dialog.error("Sorry, unexpected error");
								loading.hide();
								return false;
							}
							
							console.log(cinemas);

							if( Object.prototype.toString.call( cinemas ) != '[object Array]' ){
								loading.hide();
								dialog.error("Sorry, Something went wrong there...");
								// dialog.hide(3000);
								return;
							} else if(cinemas.length === 0){
								loading.hide();
								dialog.error("Sorry, Couldn't find any cinemas");
								// dialog.hide(3000);
							}

							var listings = [],
								complete = 0;

							for(var c = 0; c < cinemas.length; c++){

								(function(cinema){

									var t = listShowtimes(cinema.venue_id, function(res){

										var times = JSON.parse(res.data);

										listings.push({
											cinema : cinema,
											times : times
										});

										complete += 1;

										if(complete == cinemas.length - 1){
											console.log(listings);
											displayListings(listings);
											loading.hide();
										}

									});

								})(cinemas[c]);

							}


						});

					}

				});

			});

		}, true);
	
		/*locationInput.addEventListener('click', function(){
			locationInput[0].focus();
		}, false);*/

		locationInput.addEventListener('focus', function(){
			document.getElementById('goArrow').setAttribute('class', '');
		}, true);

		/*locationInput[0].addEventListener('blur', function(){

			setTimeout(function(){
				document.getElementById('goArrow').setAttribute('class', 'inactive');
			}, 500);

		}, false);*/

		filterResults.addEventListener('submit', function(e){
			e.preventDefault();
			filterResults[0].blur();
			filterExistingResults();
		});

		filterResults.addEventListener('keyup', function(){

			filterExistingResults();

		}, false);


	}

	function init(){

		if(initialised){
			console.error("Cinelist has already been initialised");
			return false;
		}

		console.log("Initialised");

		isWindows(function(){
			document.body.setAttribute('class', 'windows');
		});

		locationInput = document.getElementById('locationSearch');
		filterInput = document.getElementById('filterResults');

		addEvents();

		initialised = true;

	}

	return{
		init : init
	};

})();

(function(){
	__cinelist.init();
})();

