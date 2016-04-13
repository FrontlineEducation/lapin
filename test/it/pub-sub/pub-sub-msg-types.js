'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform publish subscribe multiple messageTypes', function () {
	const rabbit = requireNew( 'wascally' );
	const Lapin  = requireNew( process.cwd() );

	let lapin;

	before( function ( done ) {
		require( '../init' )( {
			done,
			rabbit
		} );
		lapin = new Lapin( rabbit );
	} );

	describe( 'WITH payload', function () {
		const payload   = { 'user' : 'Testfoo' };

		let published;
		let errorData = null;

		before( function ( done ) {
			lapin.subscribe( {
				'messageType' : [ 'v1.pubtestmul.get', 'v1.testpubmul.get' ]
			}, function ( data ) {
				published = data;
			} )
				.on( 'error', done )
				.on( 'ready', function ( subscriber ) {
					const messageType = 'v1.pubtestmul.get';

					if ( subscriber.messageType.slice( 8 ) === messageType ) {
						lapin.publish( 'v1.pubtestmul.get', payload, function ( error ) {
							errorData = error;
							setTimeout( done, 1000 );
						} );
					}
				} );
		} );

		it( '-- should SUBSCRIBED correct data', function () {
			expect( published ).be.an( 'object' );
			expect( published.user ).to.equal( 'Testfoo' );
			expect( errorData ).to.not.exist;
		} );
	} );
} );

