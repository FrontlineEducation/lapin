'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform request respond multiple message types', function () {
	const rabbit = requireNew( 'rabbot' );
	const Lapin  = requireNew( process.cwd() );

	let lapin;

	before( function ( done ) {
		lapin = new Lapin( rabbit );
		require( '../init' )( {
			done,
			rabbit
		} );
	} );

	describe( '- Success -', function () {
		let response, errorResponse,  request;

		before( function ( done ) {
			lapin.respond( {
				'messageType' : [ 'v1.sessions-test-mul.get', 'v1.consumers-test-mul.post' ]
			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function ( responder ) {
					let messageType = 'v1.consumers-test-mul.post';

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
