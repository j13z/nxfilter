'use strict';

/**
 * Console messages (usage, help).
 */


var fs    = require('fs');
var path  = require('path');
var chalk = require('chalk');


var scriptName = process.argv[1].split(path.sep).slice(-1);

var version = (function () {
	var filename = path.join(__dirname, '..', '..', 'package.json');
	return JSON.parse(fs.readFileSync(filename)).version;
})();


/**
 * Reads a documentation text file from `doc/cli`.
 *
 * Fills out `{{script}}` and `{{version}}` placeholders.
 */
var getText = (function () {

	var scriptRegex  = /{{script}}/g;
	var versionRegex = /{{version}}/g;

	return function (name) {

		var filename = path.join(
			__dirname, '..', '..', 'doc', 'cli', name + '.txt'
		);

		return fs.readFileSync(filename)
			.toString()
			.replace(scriptRegex, scriptName)
			.replace(versionRegex, version);
	};
})();


var messages = {

	showHelp: function () {
		console.log(getText('info'));
		this.showUsage();
		console.log(getText('examples'));
	},

	showUsage: function () {
		console.log(getText('usage'));
	},

	printError: function (message) {
		console.error(chalk.red('Error: ' + message));
		console.log();
	}
};

module.exports = messages;
