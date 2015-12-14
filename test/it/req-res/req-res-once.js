'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;

describe( 'Perform request respond with once success', function () {

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

	describe( '- Only reply once -', function () {

		var response;

		before( function ( done ) {

			lapin.respond( 'v1.reqresonce.get', function ( requestData, send ) {
				setTimeout( function () {
					send.success( 'users' );
					send.success( 'users2' );
					send.success( 'users3' );
					send.success( 'users4' );
				}, 500 );
			} )

				.on( 'error', done )
				.on( 'ready', function () {

					lapin.request( 'v1.reqresonce.get', { 'user' : 'Testfoo' }, function ( error, data ) {
						response = data;
						done();
					} );

				} );
		} );

		it( '-- should receive "users" only', function () {
			expect( response.data ).to.equal( 'users' );
		} );

	} );

} );
