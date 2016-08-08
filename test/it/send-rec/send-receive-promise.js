'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform Send( PROMISE ) Receive', function () {
	const rabbit  = requireNew( 'rabbot' );
	const Lapin   = requireNew( process.cwd() );
	const payload = { 'user' : 'Testfoo' };

	let lapin;
	let received     = null;
	let receivedData = null;
	let errorData    = null;

	before( function ( done ) {
		lapin = new Lapin( rabbit );
		require( '../init' )( {
			done,
			rabbit
		} );
	} );

	before( function ( done ) {
		lapin.receive( 'v1.sendrec-promise.get', function ( data, send ) {
			receivedData = data;
			send.success( data );
		} )
		.on( 'error', done )
		.on( 'ready', function () {
			lapin.sendPromise( 'v1.sendrec-promise.get', payload )
				.then( function ( data ) {
					received = data;
				} )
				.catch( function ( error ) {
					errorData = error;
				} )
				.finally( function () {
					setTimeout( done, 1000 );
				} );
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

	it( '-- should have a null errorData', function () {
		expect( errorData ).to.be.an( 'null' );
	} );
} );
