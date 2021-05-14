<?php 
	
	//Get parameters for api
	$latitude = urlencode($_GET["latitude"]);
	$longitude = urlencode($_GET["longitude"]);
	//Get server timezone
	date_default_timezone_set('Pacific/Auckland');
	$date = date('Y-m-d');

	if(!is_null($latitude) AND !is_null($longitude)) {

		//Url endpoint
		$request = "https://api.sunrise-sunset.org/json?lat=".$latitude."&lng=".$longitude."&date=".$date;
		
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

		echo "The latitude or longitude is null.";
	}
?>