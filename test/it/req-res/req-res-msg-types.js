'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;

describe( 'Perform request respond multiple message types', function () {

	var lapin;
	var rabbit = requireNew( 'wascally' );
	var Lapin  = requireNew( process.cwd() );

	before( function ( done ) {
		lapin = new Lapin( rabbit );
		require( '../init' )( {
			'done'   : done,
			'rabbit' : rabbit
		} );
	} );

	describe( '- Success -', function () {

		var response;
		var errorResponse;
		var request;

		before( function ( done ) {

			lapin.respond( {
				'messageType' : [ 'v1.sessions-test-mul.get', 'v1.consumers-test-mul.post' ]
			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function ( responder ) {
					var messageType = 'v1.consumers-test-mul.post';
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
