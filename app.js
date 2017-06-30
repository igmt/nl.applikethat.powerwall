'use strict';
var http = require('http');
var speechEngine;

function init() {

	speechEngine = Homey.manager('speech-output');
	Homey.log(__('loaded'));
	
}

module.exports.init = init;
