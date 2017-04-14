
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/toWorldSelector.html'

Template.toWorldSelector.helpers({});

Template.toWorldSelector.events({
	'click #toWorld'(e){
		Router.go('/world');
	}
});


Template.toWorldSelector.onCreated(function(){});

Template.toWorldSelector.onRendered(function(){});

