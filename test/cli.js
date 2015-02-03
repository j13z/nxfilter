'use strict';
/* global describe, it */
/* exported should */

/**
 * Tests the CLI: Expected output for command line arguments.
 */

var should = require('chai').should();
var exec = require('child_process').exec;
var path = require('path');


var testFile = path.join('test', 'data', 'test-data.nq');
console.log(process.cwd());
console.log(testFile);

describe('CLI', function () {

	describeArgs([ '-s', '--subject' ], function (arg) {
		it('should output only subjects', function (done) {
			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[0].should.equal('<http://example.com/s1>');
				lines[1].should.equal('_:s2');
				lines[2].should.equal('_:s2');
				lines[3].should.equal('<http://example.com/s3>');
				done();
			});
		});
	});


	describeArgs([ '-p', '--predicate' ], function (arg) {
		it('should output only predicates', function (done) {

			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[0].should.equal('<http://example.com/p1>');
				lines[1].should.equal('<http://example.com/p2>');
				lines[2].should.equal('<http://example.com/p1>');
				lines[3].should.equal('<http://example.com/p2>');
				done();
			});
		});
	});


	describeArgs([ '-o', '--object' ], function (arg) {
		it('should output only objects', function (done) {

			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[0].should.equal('<http://example.com/o1>');
				lines[1].should.equal('"o2"');
				lines[2].should.equal('<http://example.com/o3>');
				lines[3].should.equal('"o4"');
				done();
			});
		});
	});


	describeArgs([ '-g', '--graph' ], function (arg) {
		it('should output only graph labels', function (done) {

			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[0].should.equal('<http://example.com/g1>');
				lines[1].should.equal('<http://example.com/g1>');
				lines[2].should.equal('<http://example.com/g1>');
				lines[3].should.equal('<http://example.com/g2>');
				done();
			});
		});
	});


	describe('nxfilter --predicate --object:literal', function () {
		it('should output only (p, o) tuples where object is a literal', function (done) {

			run([ '--predicate --object:literal', testFile ], function (lines) {
				lines.length.should.equal(2);
				lines[0].should.equal('<http://example.com/p2> "o2"');
				lines[1].should.equal('<http://example.com/p2> "o4"');
				done();
			});
		});
	});


	describe('nxfilter --subject:bnode --predicate', function () {
		it('should output only (s, p) tuples where suject is a blank node', function (done) {

			run([ '--subject:bnode --predicate', testFile ], function (lines) {
				lines.length.should.equal(2);
				lines[0].should.equal('_:s2 <http://example.com/p2>');
				lines[1].should.equal('_:s2 <http://example.com/p1>');
				done();
			});
		});
	});


	describe('nxfilter --subject:iri --predicate', function () {
		it('should output only (s, p) tuples where suject is an IRI', function (done) {

			run([ '--subject:iri --predicate', testFile ], function (lines) {
				lines.length.should.equal(2);
				lines[0].should.equal('<http://example.com/s1> <http://example.com/p1>');
				lines[1].should.equal('<http://example.com/s3> <http://example.com/p2>');
				done();
			});
		});
	});


	describe('nxfilter -s -p="…" -o -g', function () {
		it('should filter by predicate value', function (done) {

			run([ '-s -p="http://example.com/p1" -o -g', testFile ], function (lines) {
				lines.length.should.equal(2);
				lines[0].should.equal('<http://example.com/s1> <http://example.com/p1> <http://example.com/o1> <http://example.com/g1>');
				lines[1].should.equal('_:s2 <http://example.com/p1> <http://example.com/o3> <http://example.com/g1>');
				done();
			});
		});
	});


	describeArgs([ '-d', '--delimiter' ], function (arg) {
		it('should set the delimiter', function (done) {

			run([ arg, '"\\t\\t"', '-p -o', testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[0].should.equal('<http://example.com/p1>\t\t<http://example.com/o1>');
				done();
			});
		});
	});


	describeArgs([ '-c', '--compact' ], function (arg) {
		it('should produce compact output', function (done) {
			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[1].should.equal('_:s2 http://example.com/p2 "o2" http://example.com/g1');
				done();
			});
		});
	});


	describeArgs([ '-cc', '--compact+' ], function (arg) {
		it('should produce extra compact output', function (done) {
			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[1].should.equal('s2 http://example.com/p2 o2 http://example.com/g1');
				done();
			});
		});
	});


	describeArgs([ '-np', '--no-protocol' ], function (arg) {
		it('should remove protocols from IRIs', function (done) {
			run([ arg, testFile ], function (lines) {
				lines.length.should.equal(4);
				lines[1].should.equal('_:s2 <example.com/p2> "o2" <example.com/g1>');
				done();
			});
		});
	});


	describeArgs([ '-j', '--json' ], function (arg) {
		it('should produce line-based JSON output', function (done) {
			run([ arg, '-c', testFile ], function (lines) {
				lines.length.should.equal(4);
				var array = JSON.parse(lines[1]);
				array.length.should.equal(5);

				array[0].position.should.equal('subject');
				array[0].type.should.equal('blankNode');

				array[1].position.should.equal('predicate');
				array[1].type.should.equal('iri');
				array[1].valueRaw.should.equal('<http://example.com/p2>');
				array[1].value.should.equal('http://example.com/p2');

				array[2].position.should.equal('object');
				array[2].type.should.equal('literal');

				array[3].position.should.equal('graphLabel');
				array[3].type.should.equal('iri');

				array[4].should.not.have.a.property('position');
				array[4].type.should.equal('endOfStatement');

				done();
			});
		});
	});
});


function describeArgs(args, f) {
	args.forEach(function (arg) {
		describe('nxfilter ' + arg, function () {
			f(arg);
		});
	});
}


/**
 * Runs the script on the shell.
 */
function run(args, callback) {

	var command = path.join('bin', 'nxfilter') + ' ' + args.join(' ');

	exec(command, function (error, stdout, stderr) {
		if (error) {
			error.stderr = stderr;
			throw error;
		}
		else {
			callback(stdout.split('\n').slice(0, -1));
		}
	});
}
