'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform request respond with timeout', function () {
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

	describe( '- Timeout -', function () {
		this.timeout( 45000 );

		let errorResponse;

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
