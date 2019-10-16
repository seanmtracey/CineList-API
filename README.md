# CineList API
A Node.js app that provides the data that powers [cinelist.co.uk](http://www.cinelist.co.uk).

Location information is retreived using [postcodes.io](http://postcodes.io/) and [OpenStreetMap's Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim) service.
Cinema information is parsed from [FindAnyFilm.com](http://www.findanyfilm.com/). 
CineList returns cinema listings based on information retrieved from these three sources.

## ⚠️NOTICE⚠️ 

**The CineList API is no more**. Here's [why](https://twitter.com/seanmtracey/status/1184454155861135360).

It's been fun.

## Why? 
Cinema listing websites suck, so I made CineList to fix that. CineList needed an API, so I built a service that could figure out locations, get nearby cinemas and get the times for films showing at those cinemas. 

## Building + Running

1. Clone this repo
2. Enter the cloned directory with a CLI of your choice
3. Run `npm i`
4. Run `npm run start` to begin server

A server will now be listening on port 3000. You can configure this by including a .env file in the same folder as app.js and including a `PORT` variable. For example `PORT=8080` will cause the server to bind to port 8080.

## Usage

The CineList API can provide two pieces of information. It can:

1. List cinemas within a radius of a location in the UK
   * The location can be a postcode, place name or landmark. 
   * If you know the type of input (for example, a postcode) you can use the appropriate endpoint (`/search/cinemas/postcode/:postcode`) for a quicker result
   * Otherwise, you can use the `/search/cinemas/location/:location` endpoint which will do its best to figure out the type of input
2. Find out the Cinema listings for a specific cinema

The CineList API queries Nominatim and Postcodes API to figure out the location input and, ultimately, determine a postcode. Once a postcode has been obtained, it will scrape and parse findanyfilm.co.uk to get a list of cinemas for the location. Each cinema is assigned a unique ID by Find Any Film. Using this ID, you can further query the `/get` endpoint of the CineList API to get show listings for that cinema.

## ENDPOINTS

### /search

**GET** `/search/cinemas/postcode/:postcode`

Get a list of cinemas within a certain distance of a UK postcode
```
// Request: /search/cinemas/postcode/LU12HN

// Result :
{
   "postcode":"LU12HN",
   "cinemas":[
      {
         "distance":0.6,
         "name":"Cineworld Luton, Luton, Luton",
         "id":"7530"
      },
      {
         "distance":8.6,
         "name":"Knebworth House, Knebworth, Hertfordshire",
         "id":"8053"
      },
      {
         "distance":9.3,
         "name":"Empire Hemel Hempstead, Hemel Hempstead, Hertfordshire",
         "id":"7152"
      },
      {
         "distance":9.4,
         "name":"Alban Arena, St Albans, Hertfordshire",
         "id":"3870"
      },
      {
         "distance":9.6,
         "name":"Cineworld Stevenage, Stevenage, Hertfordshire",
         "id":"7544"
      },
      {
         "distance":9.8,
         "name":"The Odyssey, St Albans, Hertfordshire",
         "id":"9105"
      }
   ]
}
```

Get a list of cinemas by searching for a UK city, town or placename

**GET** `/search/cinemas/location/:location`

```
// Request: /search/cinemas/location/St.%20Albans

// Result: 
{
   "status":"ok",
   "postcode":"AL12JF",
   "cinemas":[
      {
         "distance":0.7,
         "name":"The Odyssey, St Albans, Hertfordshire",
         "id":"9105"
      },
      {
         "distance":0.9,
         "name":"Alban Arena, St Albans, Hertfordshire",
         "id":"3870"
      },
      {
         "distance":1.7,
         "name":"Highfield Park, St. Albans, Hertfordshire",
         "id":"8844"
      },
      {
         "distance":4.0,
         "name":"Vue Watford, Watford, Hertfordshire",
         "id":"6921"
      },
      {
         "distance":4.9,
         "name":"Empire Hemel Hempstead, Hemel Hempstead, Hertfordshire",
         "id":"7152"
      },
      {
         "distance":5.0,
         "name":"Hatfield, Hatfield, Hertfordshire",
         "id":"9258"
      },
      {
         "distance":5.8,
         "name":"Hatfield House, Hatfield, Hertfordshire",
         "id":"8050"
      },
      {
         "distance":6.2,
         "name":"Palace Theatre, Watford, Hertfordshire",
         "id":"5803"
      },
      {
         "distance":8.9,
         "name":"Barnet, Barnet, Greater London",
         "id":"9233"
      },
      {
         "distance":9.1,
         "name":"Harrow Arts Centre, Pinner, Middlesex",
         "id":"4731"
      },
      {
         "distance":9.9,
         "name":"Cineworld Luton, Luton, Luton",
         "id":"7530"
      }
   ]
}
```

**GET** `/search/cinemas/coordinates/:latitude/:longitude`

Get a list of cinemas within a radius of a set of geo coordinates

```
// Request: /search/cinemas/coordinates/50.7200/-1.8800

// Result : 

{
   "status":"ok",
   "postcode":"BH26EG",
   "cinemas":[
      {
         "distance":0.3,
         "name":"ABC Bournemouth, Bournemouth, Dorset",
         "id":"7174"
      },
      {
         "distance":0.3,
         "name":"Odeon Bournemouth, Bournemouth, Dorset",
         "id":"7175"
      },
      {
         "distance":0.3,
         "name":"Bournemouth Pier, Bournemouth",
         "id":"8841"
      },
      {
         "distance":0.9,
         "name":"Odeon Bournemouth (ABC), Bournemouth",
         "id":"9342"
      },
      {
         "distance":0.9,
         "name":"Odeon Bournemouth (ODEON), Bournemouth",
         "id":"9337"
      },
      {
         "distance":3.6,
         "name":"Empire Poole (Tower Park)",
         "id":"8510"
      },
      {
         "distance":3.6,
         "name":"Empire Poole Tower Park, Poole, Dorset",
         "id":"7147"
      },
      {
         "distance":4.2,
         "name":"Lighthouse, Poole's Centre For The Arts, Poole, Dorset",
         "id":"2799"
      },
      {
         "distance":4.6,
         "name":"Regent, Christchurch, Dorset",
         "id":"1999"
      },
      {
         "distance":7.3,
         "name":"Tivoli Theatre, Wimborne, Dorset",
         "id":"1729"
      }
   ]
}
```

### /get

**GET** `/get/times/cinema/:venueID?day=[INT]`

Get the film times for a cinema. The day query parameter is an offset to get times for a day other than today.
```
// Request: /get/times/cinema/7530

// Result : 
{
   "status":"ok",
   "listings":[
      {
         "times":[
            "10:20"
         ],
         "title":"Annie (2014)"
      },
      {
         "times":[
            "10:50",
            "14:00",
            "20:20"
         ],
         "title":"Avengers: Age Of Ultron (2015)"
      },
      {
         "times":[
            "17:10"
         ],
         "title":"Avengers: Age Of Ultron (2015)"
      },
      {
         "times":[
            "10:50",
            "14:00",
            "20:20"
         ],
         "title":"Avengers: Age Of Ultron (2015)"
      },
      {
         "times":[
            "10:00"
         ],
         "title":"Big Hero 6 (2014)"
      },
      {
         "times":[
            "10:00"
         ],
         "title":"Big Hero 6 - Movies For Juniors (2015)"
      },
      {
         "times":[
            "11:20"
         ],
         "title":"Cinderella (2015)"
      },
      {
         "times":[
            "14:10"
         ],
         "title":"Fast & Furious 7 (2014)"
      },
      {
         "times":[
            "13:00",
            "15:20"
         ],
         "title":"Home (2014)"
      },
      {
         "times":[
            "12:45",
            "15:30",
            "17:20",
            "18:20",
            "20:10",
            "21:10"
         ],
         "title":"Mad Max - Fury Road (2015)"
      },
      {
         "times":[
            "10:20",
            "12:20",
            "14:20",
            "16:20"
         ],
         "title":"Moomins On The Riviera (2014)"
      },
      {
         "times":[
            "12:30",
            "14:15",
            "15:15",
            "17:00",
            "18:00",
            "19:45",
            "20:45"
         ],
         "title":"Pitch Perfect (2012)"
      },
      {
         "times":[
            "12:30",
            "14:15",
            "15:15",
            "17:00",
            "18:00",
            "19:45",
            "20:45"
         ],
         "title":"Pitch Perfect 2 (2015)"
      },
      {
         "times":[
            "11:10",
            "13:40",
            "16:15",
            "17:40",
            "18:50",
            "20:15",
            "21:15",
            "22:30"
         ],
         "title":"Poltergeist (2015)"
      },
      {
         "times":[
            "10:10"
         ],
         "title":"Shaun The Sheep (2015)"
      },
      {
         "times":[
            "18:30",
            "21:00"
         ],
         "title":"Spooks: The Greater Good (2014)"
      },
      {
         "times":[
            "13:20",
            "16:30",
            "19:40"
         ],
         "title":"Tanu Weds Manu Returns (2015)"
      },
      {
         "times":[
            "10:30"
         ],
         "title":"The SpongeBob Movie: Sponge Out Of Water (2014)"
      },
      {
         "times":[
            "10:30",
            "11:30",
            "13:30",
            "14:30",
            "16:30",
            "17:30",
            "19:30",
            "20:30"
         ],
         "title":"Tomorrowland (2015)"
      },
      {
         "times":[
            "11:50"
         ],
         "title":"Two By Two (2015)"
      },
      {
         "times":[
            "22:40"
         ],
         "title":"Unfriended (2015)"
      }
   ],
   "day":"1"
}
```
**GET** `/get/times/many/:venueID?day=[INT]`
Get the film times for the provided list of cinemas. The list of cinemas should be separated by commas. The day query parameter is an offset to get times for a day other than today.

```
// Request: http://api.cinelist.co.uk/get/times/many/10681,7517

//Result:
{
	"status": "ok",
	"results": [{
		"cinema": "10681",
		"listings": [{
			"title": "On Chesil Beach",
			"times": ["11:00"]
		},
		{
			"title": "Incredibles 2",
			"times": ["11:00",
			"12:05",
			"12:30",
			"14:00",
			"15:00",
			"17:00",
			"18:00",
			"18:40",
			"20:50",
			"21:30"]
		},
		{
			"title": "Mamma Mia! Here We Go Again",
			"times": ["11:40",
			"14:40",
			"18:50",
			"19:50",
			"20:30",
			"20:55",
			"21:40"]
		},
		{
			"title": "Patrick",
			"times": ["10:00"]
		},
		{
			"title": "Show Dogs",
			"times": ["10:15"]
		},
		{
			"title": "Ant-Man & The Wasp",
			"times": ["10:05",
			"11:30",
			"12:45",
			"13:30",
			"14:15",
			"15:30",
			"16:15",
			"17:00",
			"18:15",
			"19:00",
			"19:45",
			"20:30",
			"21:15",
			"21:45"]
		},
		{
			"title": "Hotel Transylvania 3",
			"times": ["09:50",
			"10:50",
			"12:20",
			"13:20",
			"14:50",
			"15:50",
			"18:20"]
		},
		{
			"title": "Teen Titans Go! To The Movies",
			"times": ["09:45",
			"12:00",
			"14:15",
			"16:30"]
		},
		{
			"title": "Mission: Impossible - Fallout",
			"times": ["11:05",
			"14:20",
			"15:20",
			"17:10",
			"17:40",
			"20:00",
			"21:00"]
		},
		{
			"title": "Fanney Khan",
			"times": ["17:20"]
		}]
	},
	{
		"cinema": "7517",
		"listings": [{
			"title": "Incredibles 2",
			"times": ["10:20",
			"11:20",
			"13:10",
			"14:10",
			"17:10",
			"20:10"]
		},
		{
			"title": "Mamma Mia! Here We Go Again",
			"times": ["10:50",
			"12:40",
			"15:15",
			"16:15",
			"18:00",
			"19:15",
			"20:45"]
		},
		{
			"title": "Show Dogs",
			"times": ["10:00"]
		},
		{
			"title": "Ant-Man & The Wasp",
			"times": ["12:00",
			"14:50",
			"16:40",
			"17:40",
			"19:30",
			"20:30"]
		},
		{
			"title": "Hotel Transylvania 3",
			"times": ["10:20",
			"11:50",
			"14:20",
			"16:50"]
		},
		{
			"title": "Teen Titans Go! To The Movies",
			"times": ["10:00",
			"12:15",
			"14:30"]
		},
		{
			"title": "Mission: Impossible - Fallout",
			"times": ["13:40",
			"17:00",
			"19:00",
			"20:20"]
		}]
	}]
}
```

**GET** `/get/cinema/:venueID`
Get information for a cinema with a given id.

```
// Request: https://api.cinelist.co.uk/get/cinema/7530
{
   "cinema":{
      "name":"Cineworld Luton",
      "address1":"The Galaxy, <br /> Bridge Street, <br /> Luton",
      "towncity":"Luton",
      "show_towncity":false,
      "postcode":"LU1 2NB",
      "website":"http://www1.cineworld.co.uk/cinemas/luton",
      "phone":"0871 200 2000",
      "distance":"-1",
      "lat":"51.874760",
      "lon":"-0.423730"
   }
}
