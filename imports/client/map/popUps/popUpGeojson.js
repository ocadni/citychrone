import { Template } from 'meteor/templating';
import '/imports/client/map/popUps/popUpGeojson.html';
import { color } from '/imports/client/map/geojson/colorHex.js';
import { field2text } from '/imports/client/selector/quantitySelector.js';
import { scenarioDB } from '/imports/DBs/scenarioDB.js';

Template.popUpGeojson.events({
});

Template.popUpGeojson.helpers({
	'isNotDefault'(){
		return !this.default;
	}, 
	'labelColor'(feature, val) {
		//console.log(this);
		let selColor = color(feature, false);

		return "background-color:"+ selColor(val)+';';
	},
	'labelColorDef'(feature) {
		//console.log(this);
		let city = Router.current().params.city;
		let scenarioDef = scenarioDB.findOne({'city':city, 'default':true});
		let selColor = color(feature, false);
		let time = Object.keys(scenarioDef['moments'])[0]
		let val = scenarioDef['moments'][time][feature][this.pos];
		return "background-color:"+ selColor(val)+';';
	},
	'toString'(feature, val){
		console.log(val, feature)
		$("#accessPopupChart").html('');
		let valFixed = 0
		switch(feature){
			case 'velocityScore':
				valFixed = parseFloat(val).toFixed(1);
				if(val > 0){ return valFixed.toString() + ' km/h';}
				else { return 'Not Av.';}
				break;
			case 'socialityScore':		
				valFixed = parseFloat(val/1000000).toFixed(2);
				if(val > 0){ return valFixed.toString() + 'M';}
				else { return 'Not Av.';}
				break;
			case 'population':
				valFixed = parseFloat(val).toFixed(0);
				if(val >= 0){ return valFixed.toString();}
				else { return 'Not Av.';}
				break;
		}
	},
	'toStringDef'(feature){
		//console.log(val)
		let city = Router.current().params.city;

		let scenarioDef = scenarioDB.findOne({'city':city, 'default':true});
				//console.log(scenarioDef, this)

		if(scenarioDef){
				$("#accessPopupChart").html('');
				let time = Object.keys(scenarioDef['moments'])[0]
				let val = scenarioDef['moments'][time][feature][this.pos];
				let valFixed = 0
				switch(feature){
					case 'velocityScore':
						valFixed = parseFloat(val).toFixed(1);
						if(val > 0){ return valFixed.toString() + ' km/h';}
						else { return 'Not Av.';}
						break;
					case 'socialityScore':		
						valFixed = parseFloat(val/1000000).toFixed(2);
						if(val > 0){ return valFixed.toString() + 'M';}
						else { return 'Not Av.';}
						break;
		
				}
			}else{
				return 'Not Av.'
			}
	},

	'nameQuantity'(field){
		//console.log(field, field2text[field])
		return field2text[field]
	},

});
