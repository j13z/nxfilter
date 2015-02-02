'use strict';

/**
 * Exports a settings object, loaded from a defaults file that may be overriden
 * by a user's dot file.
 */

var fs   = require('fs');
var path = require('path');

var extend = require('../utility').extend;


var loadJson = (function () {
	var commentsRegex = /\/\/.*$/gm;

	return function (filename) {
		var json = fs.readFileSync(filename).toString()
			.replace(commentsRegex, '');    // Strip comments

		return JSON.parse(json);
	};
})();


module.exports = function (dotFile, settingsFile) {

	// Load settings file

	var settings = loadJson(settingsFile);
	settings._sources = [ settingsFile ];


	// Override with dot file, if exists

	var userDir = process.env.HOME ||
	              process.env.USERPROFILE;  // Windows

	dotFile = path.join(userDir, dotFile);

	try {
		extend(settings, loadJson(dotFile));
		settings._sources.push(dotFile);
	}
	catch (e) {
		// Ignore.
	}

	return settings;
};
