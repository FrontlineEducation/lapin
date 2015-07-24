'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var Lapin  = require( process.cwd() );
var lapin  = new Lapin( rabbit );

describe( 'Perform request respond', function () {

	before( function ( done ) {
		require( './init' )( done );
	} );

	describe( '- Success -', function () {

		var response;
		var errorResponse;
		var request;

		before( function ( done ) {

			lapin.respond( 'v1.reqrestest.get', function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {

					lapin.request( 'v1.reqrestest.get', { 'user' : 'Testfoo' }, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );

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

	describe( '- Error -', function () {

		var response;
		var errorResponse;
		var request;

		before( function ( done ) {

			lapin.respond( 'v1.reqrestest.post', function ( requestData, send ) {
				request   = requestData;
				var error = new Error( 'Something went wrong' );
				send.error( error.message, error, 500 );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.post', { 'user' : 'Foo' }, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );
				} );

		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Foo' );

		} );

		it( '-- should return ERROR data', function (  ) {
			expect( errorResponse ).be.an( 'object' );
			expect( errorResponse.status ).to.exist.and.to.equal( 'error' );
			expect( errorResponse.message ).to.exist.and.to.equal( 'Something went wrong' );
			expect( errorResponse.code ).to.exist.and.to.equal( 500 );
			expect( errorResponse.data ).to.exist;

		} );

		it( '-- should have a null response', function () {

			expect( response ).to.be.an( 'null' );

		} );

	} );

	describe( '- Fail -', function () {

		var response;
		var failResponse;
		var request;

		before( function ( done ) {

			lapin.respond( 'v1.reqrestest.put', function ( requestData, send ) {
				request = requestData;
				send.fail( 'Invalid data' );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.put', { 'user' : 'Foo' }, function ( error, data ) {
						response     = data;
						failResponse = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should receive correct requestData', function () {

			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Foo' );

		} );

		it( '-- should return FAIL data', function () {

			expect( failResponse ).be.an( 'object' );
			expect( failResponse.status ).to.exist.and.to.equal( 'fail' );
			expect( failResponse.data ).to.exist.and.to.equal( 'Invalid data' );

		} );

		it( '-- should have a null response', function () {

			expect( response ).to.be.an( 'null' );

		} );

	} );

	// error for now in the future this should be FAIL
	describe( '- Error WITHOUT payload -', function () {

		var errorData;
		var response;

		before( function ( done ) {
			var payload;
			lapin.request( 'v1.reqrestest.put', payload, function ( error, data ) {
				response  = data;
				errorData = error;
				done();
			} );
		} );

		it( '-- should have a null response', function () {

			expect( response ).to.be.an( 'null' );

		} );

		it( '-- should received an errorData in request', function () {

			expect( errorData ).be.an( 'object' );
			expect( errorData.status ).to.exist.and.to.equal( 'error' );
			expect( errorData.message ).to.exist.and.to.equal( 'Invalid data' );

		} );

	} );
} );
