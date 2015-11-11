'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;

describe( 'Perform Send( PROMISE ) Receive', function () {

	var lapin;
	var received     = null;
	var receivedData = null;
	var errorData    = null;
	var payload      = { 'user' : 'Testfoo' };

	var rabbit = requireNew( 'wascally' );
	var Lapin  = requireNew( process.cwd() );

	before( function ( done ) {
		lapin = new Lapin( rabbit );
		require( '../init' )( {
			'done'   : done,
			'rabbit' : rabbit
		} );
	} );

	before( function ( done ) {

		lapin.receive( 'v1.sendrec-promise.get', function ( data, callback ) {
			receivedData = data;
			callback();
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
