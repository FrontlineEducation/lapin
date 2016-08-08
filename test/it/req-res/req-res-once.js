'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform request respond with once success', function () {
	const rabbit = requireNew( 'rabbot' );
	const Lapin  = requireNew( process.cwd() );

	let lapin;

	before( function ( done ) {
		lapin = new Lapin( {
			rabbit,
			'timeout' : {
				'ms' : 1000
			}
		} );
		require( '../init' )( {
			done,
			rabbit
		} );
	} );

	describe( '- Only reply once -', function () {
		let response;

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
