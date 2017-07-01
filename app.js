'use strict';
const settings = require('./api.js');
var http = require('http.min');
var speechEngine;
var settingsManager;

function init() {

	speechEngine = Homey.manager('speech-output');
	settingsManager = Homey.manager('settings');
	Homey.log(__('loaded'));

	if(!settingsManager.get('token')) {
		Homey.log('Trying to get token from Ampard API');
		getAuthToken(settingsManager.get('username'), settingsManager.get('password'))
			.then(function(token) { Homey.log('Login OK: ' + token); })
			.catch(function(err) { Homey.log(err); });
	} else {
		Homey.log('Token found in settings');

		getUnit(settingsManager.get('token')).then(function(unit) { Homey.log(unit); });
	}

}

function getAuthToken(username, password) {
	if(typeof username == 'undefined' || typeof password == 'undefined') {
		return Promise.reject('Username or password not set in settings');
	}

	//Create Authorization token
  var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

  //Create https call to get arlingtoken
	return http.get({
    uri: settings.base_url + settings.api_path + settings.login_path,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    }
  }).then(function(result) {
		if (!result.response) return Promise.reject('No response');
		if (result.response.statusCode !== 200) return Promise.reject('Error statuscode');

    //Set token in memory
    if(result.response.headers.arlingtoken) {
      settingsManager.set('token', result.response.headers.arlingtoken);
			return result.response.headers.arlingtoken;

    } else {
      //Error occured
      return Promise.reject('Error getting token')
    }

		return;
  });
}

function getUnit(token) {
	return http.json({
		uri: settings.base_url + settings.api_path + settings.unit_path,
		headers: {
      'arlingToken': token
    }
	}).then(function(result) {
		if (!result.response) return Promise.reject('No response');

		Homey.log(result.response);
		return result.response[0].nodeId;
	});
}

module.exports.init = init;
