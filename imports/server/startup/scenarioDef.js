import JSZip from 'jszip';
import fs from 'fs';
import { Meteor } from 'meteor/meteor';
import turf from 'turf';
import math from 'mathjs';

import { scenarioDB, initScenario } from '/imports/api/DBs/scenarioDB.js';
import {points, stops, initPoints} from '/imports/api/DBs/stopsAndPointsDB.js';
import { initVel } from '/imports/api/DBs/velocityDb.js';
import { connections } from '/imports/api/DBs/connectionsDB.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import { fileDB } from '/imports/api/DBs/fileDB.js';

import { timesOfDay } from '/imports/api/parameters.js'
//import '/public/workers/CSACore.js';

import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';

var worker = require("/public/workers/CSACore.js");

export let citiesData = {}

const findCities = function(){
	let field = 'city'
	let citiesP = points.rawCollection().distinct(field)
	let citiesS = stops.rawCollection().distinct(field)
	let citiesC = connections.rawCollection().distinct(field)
	let citiesML = metroLines.rawCollection().distinct(field)
	console.log('findCities!!');
	return [citiesP,citiesS, citiesC, citiesML]

};

const initPointsVenues = function(listPoints){
	pointsVenues = []
	for (var point_i = 0; point_i < listPoints.length; point_i++) {
		let doc = listPoints[point_i]
		pointsVenues[doc.pos] = doc.venues
	}
	return pointsVenues;
};

const computeDataCity = function(city){
	let startTime = timesOfDay[0];
	let listPoints = initPoints(city);
	let arrayN = initNeighStopAndPoint(city);
	let arrayC = initArrayC(city, startTime, startTime + 3.*3600.);
 	let pointsVenues = initPointsVenues(listPoints);
 	console.log('computeData')
 	let areaHex = turf.area(points.findOne({'city':city}).hex)/ (math.pow(10, 6));
 	let stopsList = stops.find({'city':city}, {fields : {'pos':1, 'point':1, 'city':1}, sort :{'pos':1}}).fetch();
 	return {
		'arrayN': arrayN, 
		'arrayC': arrayC, 
		'listPoints': listPoints, 
		'pointsVenues': pointsVenues,
		'areaHex' : areaHex,
		'stops' : stopsList
	 };
};

const setScenarioDefault = function(city){
	let startTime = timesOfDay[0];
	let results = [];
	let scenario = initScenario(city, 'default', startTime);
	scenario.default = true;
	let listPoints = initPoints(city);
	let arrayN = initNeighStopAndPoint(city);
	let arrayC = initArrayC(city, 0, 27.*3600.);
 	let pointsVenues = initPointsVenues(listPoints);
 	let areaHex = turf.area(points.findOne({'city':city}).hex)/ (math.pow(10, 6));
 	 let stopsList = stops.find({'city':city}, {fields : {'pos':1, 'point':1, 'city':1}, sort :{'pos':1}}).fetch();

 	console.log(areaHex, points.findOne({'city':city}).hex);

 	//console.log(arrayC, arrayN)
 	for(let time_i in timesOfDay){
 		let newVels = [];
 		let newAccess = [];
 		let newPopPot = [];
		let startTime = timesOfDay[time_i];
		for (var point_i = 0; point_i < listPoints.length; point_i++) {
			var point = listPoints[point_i];
			var returned = worker.CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues);
			//console.log(point, returned);
			if(point.pos %500 == 0) console.log(startTime/3600, returned.vAvg, point.pos)
			newVels.push(returned.vAvg);
			newAccess.push(returned.accessNew);
			newPopPot.push(returned.popMean);
		}

		scenario.moments[startTime.toString()] = scenario.moments[startTime.toString()] || {};

		let moment = scenario.moments[startTime.toString()]
		moment.newVels = newVels;
		moment.newAccess = newVels;
		moment.newPopPot = newPopPot;
	}

	console.log(Object.keys(scenario));
	scenarioDB.insert(scenario);

	return {
		'arrayN': arrayN, 
		'arrayC': arrayC, 
		'listPoints': listPoints, 
		'pointsVenues': pointsVenues,
		'areaHex' : areaHex,
		'stops' : stopsList
	 }

} 

const checkCities = function(){
	let promiseCities = findCities()

  	console.log('check Cities', promiseCities);
	
	//setScenarioDefault('torino')

	Promise.all(promiseCities).then( values => { 
		const cities =  _.union(values[0])
		console.log('cities',cities)
		for(let city_i in cities){ 	
			let city = cities[city_i]	
			let computeScenDef = scenarioDB.find({'city':city, 'default':true}).count() == 0;
			console.log(city, 'compute Scenario default?', computeScenDef);

			if(computeScenDef){
				citiesData[city] = setScenarioDefault(city);
			}else{
				citiesData[city] = computeDataCity(city);
			}
		}
		console.log('citiesData crearted', Object.keys(citiesData))

	}, reason => {
		console.log('reason', reason);
	});
};

Meteor.methods({
	'giveDataBuildScenario' : function(city,data){
		console.log(city, data)
		let toReturn = citiesData[city][data] || [];
		return toReturn;
	},
});

export {checkCities, dataCities}

