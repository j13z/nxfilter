'use strict';

module.exports = parseArguments;


// Parses a string, enables `\t` escapes.
var parseString = (function () {
	var regex = /\\t/g;

	return function (s) {
		return s.replace(regex, '\t');
	};
})();



// --- Option definitions ------------------------------------------------------

// Map: Argument -> description (property: value, argument aliases)
var optionDescriptions = [
	// Flags:

	{
		arguments: [ '--help', '-h' ],
		'wantsHelp': true
	},

	{
		arguments: [ '--compact', '-c' ],
		'compactOutput': 1
	},

	{
		arguments: [ '--compact+', '-cc' ],
		'compactOutput': 2
	},

	{
		arguments: [ '--no-protocol', '-np' ],
		'stripProtocol': true
	},

	{
		arguments: [ '--no-colors', '-nc' ],
		'colorize': false
	},

	{
		arguments: [ '--json', '-j' ],
		'jsonOutput': true
	},

	// Key-value (with transformation function):

	{
		arguments: [ '--delimiter', '-d' ],
		'delimiter': parseString
	},

	{
		arguments: [ '--limit', '-l' ],
		'literalLimit': Number
	}
];



// ---- Filter options ---------------------------------------------------------

// These get special treatment. Form:
//
//   - Boolean filter:      `--subject`
//   - Value filter:        `--subject=value`
//   - Type filter (colon): `--subject:iri`


// Map: filter argument -> filter property
var filterArgsMap = {
	'--subject':     'subject',
	'-s':            'subject',

	'--predicate':   'predicate',
	'-p':            'predicate',

	'--object':      'object',
	'-o':            'object',

	'--graph':       'graphLabel',
	'-g':            'graphLabel',
	'--graph-label': 'graphLabel',
	'--context':     'graphLabel',
	'--label':       'graphLabel'
};



// ---- Implementations --------------------------------------------------------


// Generate map from descriptions for easier access:
// arg -> { key, value }    (where `value` may be a transformation function)
//
var optionArgsMap = optionDescriptions.reduce(function (map, desc) {

	var args = desc.arguments;
	delete desc.arguments;

	// Add a property for each argument alias
	args.forEach(function (arg) {
		var key;
		var value;

		for (key in desc) {
			value = desc[key];
			break;
		}

		map[arg] = {
			key:   key,
			value: value
		};
	});

	return map;
}, {});



/**
 * @return {Object|null}
 */
var parseFilterArg = (function () {
	// Ugly argument parsing to enable a more powerful filter syntax.

	var filterArgRegex = /(-{1,2}[^=:]+)(?:([=:])(.+))?/;
	// -> (option)(`:` or `=`)(value)

	return function (arg) {

		// Filter flags:
		//
		// Construct a filter object:  { matchType, value }
		//
		// There are three match types:
		//
		// - `boolean`: e.g. `--subject`
		// - `type`:    e.g. `--subject:iri`
		// - `value`:   e.g. `--subject=value`

		var parts = arg.match(filterArgRegex);
		var elementName = filterArgsMap[parts[1]];
		var isValidArg = elementName !== undefined;

		if (isValidArg) {
			var matchType;
			var value = parts[3];

			if (parts[2]) {
				matchType = parts[2] === ':' ?
				            'type' :
				            'value';
			}
			else {
				matchType = 'boolean';
				value = true;
			}

			// Verify type
			if (matchType === 'type') {
				// Rename
				if (value === 'bnode') {
					value = 'blankNode';
				}

				var isValidType = value === 'iri' ||
				                  value === 'literal' ||
				                  value === 'blankNode';

				if (!isValidType) {
					throw new Error('Invalid type: ' + value);
				}
			}

			return {
				element: elementName,

				filter: {
					matchType: matchType,
					value:     value
				}
			};
		}

		return null;
	};
})();



// ---- Exports ----------------------------------------------------------------


/**
 * @param  {Array} args    Command line arguments
 * @return {Object}        Options object for `NxFilter`.
 * @throws {Error}         If arguments are invalid.
 */
function parseArguments(args) {
	// Stupid argument processing.

	var options = {};
	options.filters = {};

	while (args.length > 0) {
		var arg = args.shift();

		if (arg[0] === '-') {

			// Test if argument is a known option
			var desc = optionArgsMap[arg];
			if (desc) {
				var isKeyValueArg = typeof desc.value === 'function';

				if (isKeyValueArg) {
					// Apply a transformation function
					var transform = desc.value;
					desc.value = transform(args.shift());
				}

				options[desc.key] = desc.value;
				continue;
			}

			// Test if it's a filter option
			else {
				var result = parseFilterArg(arg);
				if (result) {
					options.filters[result.element] = result.filter;
					continue;
				}
			}

			// Invalid
			throw new Error('Unknown option: ' + arg);
		}

		else {
			// Other arguments, not a `-` or `--` option

			// Filename
			if (options.filename === undefined) {
				options.filename = arg;
			}
			else {
				throw new Error(
					'Invalid argument: `' + arg + '`. Filename already set.'
				);
			}
		}
	}

	return options;
}
