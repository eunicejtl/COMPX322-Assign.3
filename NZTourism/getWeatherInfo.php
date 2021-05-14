<?php 
	
	//Get parameters for api
	$latitude = urlencode($_GET["latitude"]);
	$longitude = urlencode($_GET["longitude"]);	
	$apiKey = urlencode($_GET["apiKey"]);

	if(!is_null($latitude) AND !is_null($longitude) AND !is_null($apiKey)) {

		//Url endpoint
		$request = "api.openweathermap.org/data/2.5/weather?lat=".$latitude."&lon=".$longitude."&appid=".$apiKey."&units=metric&mode=xml";

		//Set up connection for given url
		$connection = curl_init($request);

		//Configure connection
		curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);

		//Get the response
		$response = curl_exec($connection);

		echo $response;

		//Close connection
		curl_close($connection);
	}
	else {

		echo "One of the variables are missing.";
	}
?>