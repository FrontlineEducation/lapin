'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var fs     = require( 'fs' );

var requireNew = require( 'require-new' );
var Lapin      = requireNew( process.cwd() );

describe( 'Logger - Custom Log', function () {

	var lapin;
	var logPath = 'logs/customLog.log';

	before( function ( done ) {

		var logger = {
			'silly' : function ( data ) {
				console.log( data );
			}
		};

		lapin = new Lapin( {
			'rabbit' : rabbit,
			'logger' : logger
		} );
		require( '../init' )( done );

	} );

	describe( '- Success -', function () {

		var response;
		var request;

		before( function ( done ) {

			lapin.respond( {
				'messageType' : [ 'v1.logger-custom.get', 'v1.logger-custom.post' ]
			}, function ( requestData, send ) {
				request = requestData;
				send.success( { 'credentials' : 'testfoo123' } );
			} )

				.on( 'error', done )
				.on( 'ready', function ( responder ) {
					var messageType = 'v1.logger-custom.post';
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
