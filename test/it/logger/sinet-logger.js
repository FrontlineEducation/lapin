'use strict';

/* eslint no-unused-expressions:0 */

const expect     = require( 'chai' ).expect;
const os         = require( 'os' );
const requireNew = require( 'require-new' );
const fs         = require( 'fs' );
const logger     = require( '@sinet/logger' );

describe( 'Logger - Sinet', function () {
	const logPath = 'logs/sinetLogger.log';
	const rabbit  = requireNew( 'wascally' );
	const Lapin   = requireNew( process.cwd() );

	let lapin;

	describe( '- Success -', function () {
		let response, request;

		before( function ( done ) {
			// Options are for winston transports, file and console
			const options = {
				'file' : {
					'level'    : 'silly',
					'filename' : logPath
				},

				'console' : {
					'level' : 'silly'
				},

				// These are additional fields that get added to all logs
				'additional' : {
					'container' : 'lapin',

					// The items below are defaults added by the library automatically
					'hostname'   : os.hostname(),
					'dockerhost' : process.env.DOCKER_HOST || 'undefined'
				}
			};

			require( '../init' )( {
				done,
				rabbit
			} );

			lapin = new Lapin( {
				rabbit,
				'logger' : logger( options )
			} );
		} );

		before( function ( done ) {
			lapin.respond( {
				'messageType' : [ 'v1.logger-test.get', 'v1.logger-test.post' ]
			}, function ( requestData, send ) {
				request = requestData;
				send.success( { 'credentials' : 'testfoo123' } );
			} )

				.on( 'error', done )
				.on( 'ready', function ( responder ) {
					const messageType = 'v1.logger-test.post';

					if ( responder.messageType.slice( 8 ) === messageType ) {
						lapin.request( messageType, { 'user' : 'Testfoo' }, function ( error, data ) {
							response      = data;
							setTimeout( done, 1000 );
						} );
					}
				} );
		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Testfoo' );
		} );

		it( '-- should return SUCCESS data', function () {
			expect( response ).be.an( 'object' );
			expect( response.status ).to.exist.and.to.equal( 'success' );
			expect( response.data.credentials ).to.exist.and.to.equal( 'testfoo123' );
		} );

		it( '-- should have a log file', function ( done ) {
			fs.exists( logPath, function ( exists ) {
				expect( exists ).to.be.equal( true );
				done();
			} );
		} );
	} );
} );
