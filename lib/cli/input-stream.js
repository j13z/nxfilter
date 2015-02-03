'use strict';

module.exports = getInputStream;

var fs   = require('fs');
var zlib = require('zlib');


/**
 * Retuns an input stream, either `stdin` or a stream to a file (gzip
 * supported), if a filename argument is passed.
 *
 * @param {[String]} Optional `filename`, reads from `stdin` if `undefined`.
 * @return {Stream}
 */
function getInputStream(filename) {

	if (filename) {
		if (!fs.existsSync(filename)) {
			throw new Error('Cannot open file: ' + filename);
		}

		// Get a file stream -- uncompressed or gzip
		var fileStream = fs.createReadStream(filename);
		var extension = filename.slice(filename.lastIndexOf('.') + 1);

		if (extension === 'gz') {
			return fileStream.pipe(zlib.createGunzip());
		} else {
			return fileStream;
		}
	}
	else {
		// stdin
		process.stdin.setEncoding('utf8');
		return process.stdin;
	}
}
