'use strict';

/**
 * Console messages (usage, help).
 */

var fs    = require('fs');
var path  = require('path');
var chalk = require('chalk');

var scriptName = process.argv[1].split(path.sep).slice(-1);

module.exports = {

	showInfo: function () {
		console.log(scriptName + ':  Filters elements of RDF N-Triples and N-Quads.  (v' + getVersion() + ')');
		console.log();
	},

	showUsage: function (exitStatus) {

		console.log([
			'Usage: ' + scriptName + ' [filters] [options] [filename]',
			'',
			'    Reads input from stdin, if no filename is passed.',
			'',
			'Filters:',
			'',
			'    -s, --subject',
			'    -p, --predicate',
			'    -o, --object',
			'    -g, --graph',
			'',
			'    Modifiers: `=<value>` or `:<type>` (types: `iri`, `literal` or `bnode`)',
			'',
			'Options:                                                      default',
			'',
			'    -d,  --delimiter      Delimiter string for elements       [space]' ,
			'    -c,  --compact        Remove brackets from IRIs           [false]',
			'    -cc, --compact+       Extra compact, output only values   [false]',
			'    -np, --no-protocol    Remove protocols from IRIs          [false]',
			'    -nc, --no-colors      Disable colored output              [false]',
			'    -l,  --limit <n>      Limit literal output length         [no limit]',
			'',
			'    Default settings and output colors can be specified in `~/.nxfilterrc`.',
			'',
			'Examples:',
			'',
			'    Get predicates and objects as TSV:',
			'',
			'        ' + scriptName + ' -p -o --delimiter \'\\t\' data.nt.gz',
			'',
			'    Get most frequent predicates (pipe):',
			'',
			'        cat data.nt | ' + scriptName + ' -p | sort | uniq -c | sort -n -r | head',
			'',
			'    Output (predicate, object) tuples where the object is a literal:',
			'',
			'        ' + scriptName + ' --predicate --object:literal data.nt.gz'
		].join('\n'));

		process.exit(exitStatus);
	},


	printError: function (message) {
		console.error(chalk.red('Error: ') + message);
		console.log();
	}
};


/**
 * Reads the version numner from `package.json`.
 */
function getVersion() {
	var filename = path.join(__dirname, '..', '..', 'package.json');
	return JSON.parse(fs.readFileSync(filename)).version;
}
