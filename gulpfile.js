'use strict';

/* eslint no-process-exit:0 */

const colors      = require( 'colors/safe' );
const del         = require( 'del' );
const enforcement = require( '@sinet/coverage-enforcement' );
const gulp        = require( 'gulp' );
const istanbul    = require( 'gulp-istanbul' );
const mocha       = require( 'gulp-mocha' );
const mkdirp      = require( 'mkdirp' );

gulp.task( 'clean-coverage', function () {
	del( [ 'instrumented' ] );
} );

gulp.task( 'test', [ 'clean-coverage', 'create-log-dir' ], function () {
	const covEnforcerOpts = { 'thresholds' : enforcement.thresholds };

	const paths = {
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

		'test'     : [ 'test/unit/**/*.js', 'test/it/**/*.js' ],
		'coverage' : 'instrumented'
	};

	const mochaOptions = {
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
						.on( 'error', function ( mochaError ) {
							console.log( mochaError.stack );
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

gulp.task( 'create-log-dir', function ( callback ) {
	mkdirp( 'logs', function ( error ) {
		if ( error ) {
			console.log( error.stack );
			process.exit( 1 );
		}
		callback();
	} );
} );

gulp.task( 'inspect-queues', function () {
	// delay to give time reading queues
	setTimeout( function () {
		const spawn = require( 'child_process' ).spawn;
		const queue = spawn( 'node', [ 'test/api' ] );

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
