'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var Lapin  = require( process.cwd() );
var lapin  = new Lapin( rabbit );

describe( 'Perform request respond multiple message types', function () {

	before( function ( done ) {
		require( './init' )( done );
	} );

	describe( '- Success -', function () {

		var response;
		var errorResponse;
		var request;

		before( function ( done ) {

			lapin.respond( {
				'messageType' : [ 'v1.sessions.get', 'v1.consumers.post' ]
			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function ( responder ) {
					var messageType = 'v1.consumers.post';
					if ( responder.messageType.slice( 8 ) === messageType ) {
						lapin.request( messageType, { 'user' : 'Testfoo' }, function ( error, data ) {
							response      = data;
							errorResponse = error;
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
			expect( response.data ).to.exist.and.to.equal( 'users' );

		} );

		it( '-- should have a null error response', function () {
			expect( errorResponse ).to.be.an( 'null' );

		} );

	} );

} );
