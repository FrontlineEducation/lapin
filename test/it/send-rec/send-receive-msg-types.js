'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform Send Receive multiple messageTypes', function () {
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

	describe( 'WITH payload', function () {
		let received, receivedData;

		const payload = { 'user' : 'Testfoo' };

		before( function ( done ) {
			lapin.receive( {
				'messageType' : [ 'v1.sendrectest.get', 'v1.sendrec.find' ]
			}, function ( data, send ) {
				receivedData = data;
				send.success( data );
			} )
				.on( 'error', done )
				.on( 'ready', function ( sender ) {
					const messageType = 'v1.sendrectest.get';

					if ( sender.messageType.slice( 9 ) === messageType ) {
						lapin.send( messageType, payload, function ( error, data ) {
							received = data;
							setTimeout( done, 1000 );
						} );
					}
				} );
		} );

		it( '-- should RECEIVED correct data', function () {
			expect( receivedData ).be.an( 'object' );
			expect( receivedData.user ).to.equal( 'Testfoo' );
		} );

		it( '-- should SEND success data', function () {
			expect( received ).be.an( 'object' );
			expect( received.status ).to.exist.and.to.equal( 'success' );
			expect( received.data ).to.exist.and.to.equal( 'Message sent' );
		} );
	} );
} );
