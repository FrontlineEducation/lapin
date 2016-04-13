'use strict';

/* eslint no-unused-expressions:0 */

const expect     = require( 'chai' ).expect;
const fs         = require( 'fs' );
const requireNew = require( 'require-new' );

describe( 'Logger - Custom Log', function () {
	const logPath = 'logs/customLog.log';
	const rabbit  = requireNew( 'wascally' );
	const Lapin   = requireNew( process.cwd() );

	let lapin;

	describe( '- Success -', function () {
		let response, request;

		before( function ( done ) {
			const logger = {
				silly ( data ) {
					console.log( data );
				}
			};

			require( '../init' )( {
				done,
				rabbit
			} );

			lapin = new Lapin( {
				rabbit,
				logger
			} );
		} );

		before( function ( done ) {
			lapin.respond( {
				'messageType' : [ 'v1.logger-custom.get', 'v1.logger-custom.post' ]
			}, function ( requestData, send ) {
				request = requestData;
				send.success( { 'credentials' : 'testfoo123' } );
			} )

				.on( 'error', done )
				.on( 'ready', function ( responder ) {
					const messageType = 'v1.logger-custom.post';

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

		it( '-- should not have a log file', function ( done ) {
			fs.exists( logPath, function ( exists ) {
				expect( exists ).to.be.equal( false );
				done();
			} );
		} );
	} );
} );
