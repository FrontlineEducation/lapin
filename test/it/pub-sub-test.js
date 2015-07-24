'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var Lapin  = require( process.cwd() );
var lapin  = new Lapin( rabbit );

describe( 'Perform publish subscribe', function () {

	before( function ( done ) {
		require( './init' )( done );
	} );

	describe( 'WITH payload', function () {
		var published;
		var payload   = { 'user' : 'Testfoo' };
		var errorData = null;

		before( function ( done ) {

			lapin.subscribe( 'v1.pubtest.get', function ( data ) {
				published = data;
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.publish( 'v1.pubtest.get', payload, function ( error ) {
						errorData = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should SUBSCRIBED correct data', function () {

			expect( published ).be.an( 'object' );
			expect( published.user ).to.equal( 'Testfoo' );
			expect( errorData ).to.not.exist;

		} );
	} );

	describe( 'WITHOUT payload', function () {

		var errorData;

		before( function ( done ) {
			var payload;
			lapin.publish( 'v1.pubtest.get', payload, function ( error ) {
				errorData = error;
				done();
			} );
		} );

		it( '-- should subscribed errorData in publish', function () {

			expect( errorData ).be.an( 'object' );
			expect( errorData.status ).to.exist.and.to.equal( 'error' );
			expect( errorData.message ).to.exist.and.to.equal( 'Invalid data' );

		} );

	} );
} );
