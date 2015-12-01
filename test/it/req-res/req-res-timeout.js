'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;

describe( 'Perform request respond with timeout', function () {

	var lapin;
	var rabbit = requireNew( 'wascally' );
	var Lapin  = requireNew( process.cwd() );

	before( function ( done ) {
		lapin = new Lapin( {
			'rabbit'  : rabbit,
			'timeout' : {
				'ms' : 1000
			}
		} );
		require( '../init' )( {
			'done'   : done,
			'rabbit' : rabbit
		} );
	} );

	describe( '- Timeout -', function () {

		this.timeout( 45000 );

		var errorResponse;

		before( function ( done ) {

			lapin.respond( 'v1.reqrestimeout.get', function ( requestData, send ) {
				setTimeout( function () {
					send.success( 'users' );
				}, 41000 );
			} )

				.on( 'error', done )
				.on( 'ready', function () {

					lapin.request( 'v1.reqrestimeout.get', { 'user' : 'Testfoo' }, function ( error ) {
						errorResponse = error;
						done();
					} );

				} );
		} );

		it( '-- should receive timeout', function () {

			expect( errorResponse.status ).to.exist.and.to.equal( 'error' );
			expect( errorResponse.data ).to.exist.and.to.equal( 'Request timeout' );

		} );

	} );

} );
