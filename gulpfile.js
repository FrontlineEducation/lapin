'use strict';

/* eslint no-process-exit:0 */

var colors      = require( 'colors/safe' );
var del         = require( 'del' );
var enforcement = require( '@sinet/coverage-enforcement' );
var gulp        = require( 'gulp' );
var istanbul    = require( 'gulp-istanbul' );
var mocha       = require( 'gulp-mocha' );

gulp.task( 'clean-coverage', function () {
	del( [ 'instrumented' ] );
} );

gulp.task( 'test', [ 'clean-coverage' ], function () {
	var covEnforcerOpts = { 'thresholds' : enforcement.thresholds };

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
			'!test/api/**',
			'!test/**'
		],

		'test'     : [ 'test/it/**/*.js', 'test/unit/**/*.js' ],
		'coverage' : 'instrumented'
	};

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
					'dir'       : paths.coverage,
					'reporters' : enforcement.reporters,

					'reportOpts' : {
						'dir'        : paths.coverage,
						'watermarks' : enforcement.watermarks
					}
				} ) )

				.pipe( istanbul.enforceThresholds( covEnforcerOpts )
					.on( 'error', function () {
						console.log( 'error - coverage enforcer' );
						enforcement.log();

						process.exit( 1 );
					} ) )

				.on( 'error', function () {
					process.exit( 1 );
				} )

				.on( 'end', function () {
					enforcement.log();

					process.exit();
				} );
		} );
} );

gulp.task( 'inspect-queues', function () {

	// delay to give time reading queues
	setTimeout( function () {

		var spawn = require( 'child_process' ).spawn;
		var queue = spawn( 'node', [ 'test/api' ] );

		queue.stdout.on( 'data', function ( data ) {
			console.log( data.toString() );
		} );

		queue.stderr.on( 'data', function ( data ) {

			if ( parseInt( data.toString(), 10 ) ) {
				console.log( colors.red( 'error - having unacked/ready msgs' ) );
			} else {
				console.log( colors.green( 'Success - no unacked/ready msgs' ) );
			}
			process.exit( data );
		} );

	}, 2000 );

} );
