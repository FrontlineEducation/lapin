'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var Lapin  = require( process.cwd() );
var lapin  = new Lapin( rabbit );

describe( 'Perform Send Receive', function () {

	before( function ( done ) {
		require( './init' )( done );
	} );

	describe( 'WITH payload', function () {

		var received;
		var receivedData;
		var payload = { 'user' : 'Testfoo' };

		before( function ( done ) {

			lapin.receive( 'v1.sendreceivetest.get', function ( data, callback ) {
				receivedData = data;
				callback();
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.send( 'v1.sendreceivetest.get', payload, function ( error, data ) {
						received = data;
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
			expect( received.message ).to.exist.and.to.equal( 'Message sent' );

		} );
	} );

	describe( 'WITH payload and OPTIONS', function () {

		var received;
		var receivedData;
		var payload = { 'user' : 'Testfoo' };

		before( function ( done ) {

			lapin.receive( {
				'messageType' : 'v1.sendrectestOpts.get',
				'limit'       : 1,
				'noBatch'     : true
			}, function ( data, callback ) {
				receivedData = data;
				callback();
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.send( 'v1.sendrectestOpts.get', payload, function ( error, data ) {
						received = data;
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
			expect( received.message ).to.exist.and.to.equal( 'Message sent' );

		} );
	} );

	describe( 'WITHOUT payload', function () {

		var received;
		var failData;

		before( function ( done ) {
			var payload;
			lapin.send( 'v1.sendrectest.get', payload, function ( error, data ) {
				received  = data;
				failData = error;
				done();
			} );
		} );

		it( '-- should have a null response', function () {

			expect( received ).to.be.an( 'null' );

		} );

		it( '-- should received an failData in request', function () {

			expect( failData ).be.an( 'object' );
			expect( failData.status ).to.exist.and.to.equal( 'fail' );
			expect( failData.message ).to.exist.and.to.equal( 'Invalid data' );

		} );

	} );

} );
