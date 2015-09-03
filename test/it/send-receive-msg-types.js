'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var Lapin  = require( process.cwd() );
var lapin  = new Lapin( rabbit );

describe( 'Perform Send Receive multiple messageTypes', function () {

	before( function ( done ) {
		require( './init' )( done );
	} );

	describe( 'WITH payload', function () {

		var received;
		var receivedData;
		var payload = { 'user' : 'Testfoo' };

		before( function ( done ) {

			lapin.receive( {
				'messageType' : [ 'v1.sendrectest.get', 'v1.sendrec.find' ]
			}, function ( data, callback ) {
				receivedData = data;
				callback();
			} )
				.on( 'error', done )
				.on( 'ready', function ( sender ) {
					var messageType = 'v1.sendrectest.get';
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
			expect( received.message ).to.exist.and.to.equal( 'Message sent' );

		} );
	} );
} );
