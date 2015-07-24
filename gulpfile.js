'use strict';

/* eslint no-process-exit:0 */

// load third party modules
var del             = require( 'del' );
var gulp            = require( 'gulp' );
var mocha           = require( 'gulp-mocha' );
var istanbul        = require( 'gulp-istanbul' );
var covEnforcerOpts = {
	'thresholds' : require( 'sinet-istanbul-coverage-enforcement' )
};

var paths = {
	'cover' : [

		// Include everything to be covered
		'**/*.js',

		// Exclude files
		'!gulpfile.js',

		// Exclude directories that are not code
		'!config/**',
		'!instrumented/**',
		'!node_modules/**',
		'!test/**'
	],

	'test'     : [ 'test/**/*.js' ],
	'coverage' : 'instrumented'
};

gulp.task( 'clean-coverage', function () {
	del( [ 'instrumented' ] );
} );

gulp.task( 'test', [ 'clean-coverage' ], function () {

	var coverageDir  = paths.coverage;
	var mochaOptions = {
		'ui'       : 'bdd',
		'reporter' : 'spec',
		'bail'     : true,
		'timeout'  : 5000
	};

	return gulp.src( paths.cover )
		.pipe( istanbul( { 'includeUntested' : true } ) )
		.pipe( istanbul.hookRequire() )

		.on( 'finish', function () {

			gulp.src( paths.test, { 'read' : false } )

				.pipe(
					mocha( mochaOptions )
						.on( 'error', function () {
							process.exit( 1 );
						}
				) )

				.pipe( istanbul.writeReports( {
					'dir'        : coverageDir,
					'reportOpts' : { 'dir' : coverageDir },
					'reporters'  : [ 'text', 'text-summary', 'json', 'html' ]
				} ) )

				.pipe( istanbul.enforceThresholds( covEnforcerOpts )
					.on( 'error', function () {
						console.log( 'error - coverage enforcer' );
						process.exit( 1 );
					} ) )

				.on( 'error', function () {
					process.exit( 1 );
				} )

				.on( 'end', function () {
					process.exit();
				} );
		} );
} );
