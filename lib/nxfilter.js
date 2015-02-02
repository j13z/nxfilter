'use strict';

/**
 * Exports a constructor for a N-Triples / N-Quads filter.
 */

var Readline     = require('readline');
var EventEmitter = require('events').EventEmitter;
var Stream       = require('stream');

var parser = require('rdf-nx-parser');


var positionNameMap = {
	0: 'subject',
	1: 'predicate',
	2: 'object',
	3: 'graphLabel'
};
Object.freeze(positionNameMap);


/**
 * Constructor for an event-based N-Quads / N-Triples filter.
 *
 * Filters out elements of statements, given a `filters` objects and an input
 * stream. The `filters` object may have the following properties, which are
 * individual filter objects themselves:
 *
 * - `subject`
 * - `predicate`
 * - `object`
 * - `graphLabel`
 *
 * These individual filter objects have two properties: `matchType` and `value`.
 * Valid match types are: `boolean` (`true` selects the element), `type` (`iri`,
 * `literal` or `bnode`) and `value`.
 *
 * The created instance emits `line`, `end` and `error` events, to which
 * listeners can be attached with the `on` method (the only method provided).
 *
 *
 * @param {Stream}  An Input stream that provides N-Triples or N-Quads strings.
 * @param {Object}  Filters per element position (s, p, o, g).
 *
 * @constructor
 */
module.exports = function NxFilter(inputStream, filters) {

	var emitter = new EventEmitter();

	var elementFilter = makeElementFilter(filters);

	// Number of elements that must be matched per line
	var requiredMatchCount = Object.keys(filters).length;


	// Use `readline` for line based reading
	var readline = Readline.createInterface({
		input:  inputStream,
		output: new Stream()
	});

	// Read input stream, emit events:
	readline
		.on('line', function (line) {

			var elements = parser.tokenize(
				line,
				{ includeRaw: true }
			)
			.map(function (token, index) {
				// Add an element position name
				// (mutates the array elements)
				token.position = positionNameMap[index];
				return token;
			})
			.filter(elementFilter);

			if (elements.length >= requiredMatchCount) {
				emitter.emit('line', elements);
			}
		})
		.on('close', function () {
			emitter.emit('end');
		})
		.on('error', function () {
			emitter.emit('error');
		});


	// Delegate:

	this.on = function () {
		emitter.on.apply(emitter, arguments);
		return this;
	};
};



function makeElementFilter(filters) {
	// (Keeps `filter` object in a closure.)

	var useFilters = Object.keys(filters).length > 0;


	function filterByType(element, filter) {
		return element.type === filter;
	}


	function filterByValue(element, filter) {
		// Supports some primitive wildcard matches (still case-sensitive).

		var value = element.value;

		var useSuffixWildCard = filter.slice(-1) === '*';   // `foo*`
		var usePrefixWildCard = filter[0]        === '*';   // `*foo`

		var useBothWildCards = useSuffixWildCard &&         // `*foo*`
		                       usePrefixWildCard;

		if (useBothWildCards) {
			filter = filter.slice(1, filter.length - 1);    // remove `*`s
			return value.indexOf(filter) !== -1;
		}

		if (useSuffixWildCard) {
			filter = filter.slice(0, filter.length - 1);    // remove `*`
			return value.indexOf(filter) === 0;
		}

		if (usePrefixWildCard) {
			filter = filter.slice(1);                       // remove `*`

			var pos = value.indexOf(filter);
			return pos !== -1 &&
			       pos === value.length - filter.length;
		}

		return value === filter;    // Strict match
	}


	return function (element) {

		if (!useFilters) {
			// Don't filter out any element.
			return true;
		}

		// Get the filter for the element position
		var filter = filters[element.position];

		if (filter === undefined) {
			return false;
		}

		switch (filter.matchType) {
			case 'type':    return filterByType(element, filter.value);
			case 'value':   return filterByValue(element, filter.value);
			case 'boolean': return filter.value === true;
		}
	};
}
