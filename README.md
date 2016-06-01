# CineList API
A Node.js that provides the data that powers cinelist.co.uk.

Location information is retreived using postcodes.io and OpenStreetMap's Nominatim service.
Cinema information is parsed from FindAnyFilm.co.uk and returns Cinema listings based on a location.

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
