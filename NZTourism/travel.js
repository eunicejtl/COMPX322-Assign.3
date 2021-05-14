//Public variables
var mymap;
var recentSearches = [];

/*
* Leaflet Map required functions
*/
var setupLeafletMap = function() {
	
	//Default latitude and longitude is set to Hamilton town
	mymap = L.map('mapid').setView([-37.787621, 175.281319], 13);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXVuaWNlanRsIiwiYSI6ImNrYXhsYWt1djA3OXcyeG54eHpqYnl5bDIifQ.EJi2O5C5iCnUiGTh-47sGg', {
    	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    	maxZoom: 18,
   	 	id: 'mapbox/streets-v11',
    	tileSize: 512,
    	zoomOffset: -1
	}).addTo(mymap);
}

/* Get town by input */
var getTownName = function() {

	var town_name = document.getElementById("town").value;
	console.log(town_name);

	//Check if input is empty
	if(town_name == "") {

		alert("Please enter a valid town.");
		return;
	}

	if(recentSearches.length == 0) {
		//Get geocode of new input
		getGeocode(town_name);
	}
	else {
		//Check if input is already in the list
		for(var i = 0; i < recentSearches.length; i++) {
			if(town_name == recentSearches[i].getTownName()) {
				//If input is already in the list
				updateMap(recentSearches[i]);
			}
			else {
				//Get geocode of new input
				getGeocode(town_name);
			}
		}
	}
};

/*
* Get geocode for leaflet
*/
var getGeocode = function(town_name) {

	//Send request to API using fetch
	fetch('https://www.mapquestapi.com/geocoding/v1/address?key=Eral1k7PVMcLAkG5mGIabakj90gH9Ozq&location=' + town_name + ",NZ")
	.then(response => response.json())
	.then(geocodeResult => getGeocodeCallback(town_name, geocodeResult));
};

/* Geocode Callback */
var getGeocodeCallback = function(town_name, geocodeResult) {
	var locations;
	var latitude;
	var longitude;

	locations = geocodeResult.results[0].locations;

	for(var i = 0; i < locations.length; i++) {
		latitude = locations[i].latLng.lat;
		longitude = locations[i].latLng.lng;
	}
	
	//Send request to api to get sunrise and sunset time
	fetch('getSunriseSunset.php?latitude=' + latitude + '&longitude=' + longitude)
	.then(response => response.json())
	.then(sunRiseSetResult => getSunriseSunset(town_name, latitude, longitude, sunRiseSetResult));
};

/* Get sunrise and sunset times */
var getSunriseSunset = function(town_name, latitude, longitude, sunRiseSetResult) {

	//Get sunrise and adjust timezone 
	var sunrise = sunRiseSetResult.results.sunrise;
	var sunriseFormatted = sunrise.replace("PM", "AM");

	//Get sunset and adjust timezone
	var sunset = sunRiseSetResult.results.sunset;
	var sunsetFormatted = sunset.replace("AM", "PM");

	/* AJAX	- using AJAX to send request to API */
	var apiKey = "cd86f1fa1e7c04da575bc679b57c984f";
	var url = "getWeatherInfo.php?latitude=" + latitude + "&longitude=" + longitude + "&apiKey=" + apiKey;
	var request = new XMLHttpRequest();
	request.open("GET", url, true);

	request.onreadystatechange = function() {
		//IF REQUEST IS READY TO BE PROCCESSED
		if (request.readyState === 4) {
			//IF REQUEST WAS SUCCESSFUL
			if (request.status === 200) {
				//GET RESPONSE AND CALLBACK
				let response = request.responseText;
				//CALLBACK
				currWeatherInfo(town_name, latitude, longitude, sunriseFormatted, sunsetFormatted, response);
			}
			else {
				alert("An error occured: " + request.statusText); 
			}
		}
	}
	request.send();
};

/* Get weather info */
var currWeatherInfo = function(town_name, latitude, longitude, sunrise, sunset, weatherResult) {

	//Parse to XML format
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(weatherResult, "text/xml");

	//Get values to display
	var weather = xmlDoc.getElementsByTagName("weather")[0].getAttribute("value");
	var min_temp = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("min");
	var max_temp = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("max");

	//Create new object to store town info
	var addTown = new Town(town_name, latitude, longitude, sunrise, sunset, weather, min_temp, max_temp);

	//Store searched town in array
	recentSearches.unshift(addTown);

	//Pass object to update map
	updateMap(addTown);
};

/*
* Update town shown on the map
*/
var updateMap = function(townObj) 
{
	//UI Properties
	var townUI = {
		listContainer: null,
		townLi: null,
		infoContainer: null,
		sunRiseSet: null,
		weatherInfo: null,
		minTemp: null,
		maxTemp: null
	}

	//Update map display
	mymap.panTo([townObj.getLatitude(), townObj.getLongitude()], 13);

	//Check if array is empty
	if(recentSearches == null) return;

	var listContainer = document.getElementById("uList");
	var weatherInfoContainer = document.getElementById("info-container");

	//Clear display
	while(listContainer.hasChildNodes()) listContainer.removeChild(listContainer.lastChild);
	while(weatherInfoContainer.hasChildNodes()) weatherInfoContainer.removeChild(weatherInfoContainer.lastChild);


	/** Display list of towns ***************
	*	Get container for weather info 		*
	****************************************/

	//Remove duplicates in the list
	for (var i = 0; i < recentSearches.length; i++) {
	    var item = recentSearches[i];
	    for (var j = 0; j < recentSearches.length; j++) {
			//If not the same item
	      	if (i != j) {
				if (recentSearches[i].getTownName() == recentSearches[j].getTownName()) {
				  //Remove item
				  recentSearches.splice(j, 1);
				}
	      	}
	    }
	    //Check if list has more than 5 item
	    if (recentSearches.length > 5) {
	    	//Remove oldest search
	      	recentSearches.pop();
	    }
  	}

  	//Go through array to display list of towns
	for(var i = 0; i < recentSearches.length; i++) {
		//Get container of the list
		townUI.listContainer = document.getElementById("uList");
		townUI.townLi = document.createElement("li");
		townUI.townLi.innerHTML = recentSearches[i].getTownName();
		townUI.listContainer.appendChild(townUI.townLi);
	}


	/** Display Weather info ****************
	*	Get container for weather info 		*
	****************************************/
	townUI.infoContainer = document.getElementById("info-container");
	townUI.sunRiseSet = document.createElement("p");
	townUI.sunRiseSet.innerHTML = "The sunrise time is " + townObj.getSunrise() + " and the sunset time is " + townObj.getSunset() + " in " + townObj.getTownName();
	townUI.weatherInfo = document.createElement("p");
	townUI.weatherInfo.innerHTML = "Current Weather in " +  townObj.getTownName() + ": " +  townObj.getWeather();
	townUI.minTemp = document.createElement("p");
	townUI.minTemp.innerHTML = "Minimum Temperature: " +  townObj.getMinTemp() + "&#8451;";
	townUI.maxTemp = document.createElement("p");
	townUI.maxTemp.innerHTML = "Maximum Temperature: " +  townObj.getMaxTemp() + "&#8451;";
	townUI.infoContainer.appendChild(townUI.sunRiseSet);
	townUI.infoContainer.appendChild(townUI.weatherInfo);
	townUI.infoContainer.appendChild(townUI.minTemp);
	townUI.infoContainer.appendChild(townUI.maxTemp);
};

/* List of towns are clickable and map and weather info updates accordingly */
var getClickedTown = function(event) {

	for(var i = 0; i < recentSearches.length; i++) {
		//Get the object that matches clicked town
		if(event.target.textContent == recentSearches[i].getTownName()) {
			var addTown = new Town(recentSearches[i].getTownName(), recentSearches[i].getLatitude(), recentSearches[i].getLongitude(), recentSearches[i].getSunrise(), recentSearches[i].getSunset(), recentSearches[i].getWeather(), recentSearches[i].getMinTemp(), recentSearches[i].getMaxTemp());
			updateMap(addTown);
		}
	}
}

	/****************************************************
	* 	Construction Function for town 					*
	* 	holds town name, latitude, longitude, 	 		*
	* 	sunrise and sunset times, and weather info.		*
	****************************************************/

var Town = function(town_name, latitude, longitude, sunrise, sunset, weather, min_temp, max_temp) 
{
	var townProperties = {

		_town_name: town_name,
		_latitude: latitude,
		_longitude: longitude,
		_sunrise: sunrise,
		_sunset: sunset, 
		_weather: weather,
		_min_temp: min_temp,
		_max_temp: max_temp
	}

	/* Getters */
	this.getTownName = function() {
		return town_name;
	}

	this.getLatitude = function() {
		return latitude;
	}

	this.getLongitude = function() {
		return longitude;
	}

	this.getSunrise = function() {
		return sunrise;
	}

	this.getSunset = function() {
		return sunset;
	}

	this.getWeather = function() {
		return weather;
	}

	this.getMinTemp = function() {
		return min_temp;
	}

	this.getMaxTemp = function() {
		return max_temp;
	}
};