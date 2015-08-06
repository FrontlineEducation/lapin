'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var rabbit = require( 'wascally' );
var Lapin  = require( process.cwd() );
var lapin  = new Lapin( rabbit );
var Joi    = require( 'joi' );

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

	describe( '- Success with options -', function () {

		var response;
		var errorResponse;
		var request;

		before( function ( done ) {

			lapin.respond( {
				'messageType' : 'v1.reqrestestOpts.get',
				'limit'       : 1,
				'exchange'    : 'opts'
			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {

					lapin.request( {
						'messageType' : 'v1.reqrestestOpts.get',
						'exchange'    : 'opts'
					}, { 'user' : 'Testfoo' }, function ( error, data ) {
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
	describe( '- Success with JOI Validation -', function () {

		var response;
		var errorResponse;
		var request;

		var validationData = {
			'username'  : 'Testfoo',
			'password'  : 'foo',
			'birthyear' : '1990'
		};

		before( function ( done ) {

			lapin.respond( {
				'messageType' : 'v1.reqrestestJoi.get',
				'validate'    : Joi.object().keys( {
					'username'     : Joi.string().alphanum().min( 3 ).max( 30 ).required(),
					'password'     : Joi.string().regex( /[a-zA-Z0-9]{3,30}/ ),
					'access_token' : [ Joi.string(), Joi.number() ],
					'birthyear'    : Joi.number().integer().min( 1900 ).max( 2013 ),
					'email'        : Joi.string().email()
				} ).with( 'username', 'birthyear' ).without( 'password', 'access_token' )

			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {

					lapin.request( 'v1.reqrestestJoi.get', validationData, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );

				} );
		} );

		it( '-- should receive correct requestData', function () {

			expect( request ).be.an( 'object' );
			expect( request.username ).to.exist.and.to.equal( validationData.username );
			expect( request.password ).to.exist.and.to.equal( validationData.password );
			expect( request.birthyear ).to.exist.and.to.equal( validationData.birthyear );

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

	describe( '- Error with JOI Validation -', function () {

		var response;
		var failResponse;
		var request;

		var validationData = {
			'username' : 'Testfoo',
			'password' : 'foo'
		};

		before( function ( done ) {

			lapin.respond( {
				'messageType' : 'v1.reqrestestJoiFail.get',
				'validate'    : Joi.object().keys( {
					'username'     : Joi.string().alphanum().min( 3 ).max( 30 ).required(),
					'password'     : Joi.string().regex( /[a-zA-Z0-9]{3,30}/ ),
					'access_token' : [ Joi.string(), Joi.number() ],
					'birthyear'    : Joi.number().integer().min( 1900 ).max( 2013 ),
					'email'        : Joi.string().email()
				} ).with( 'username', 'birthyear' ).without( 'password', 'access_token' )

			}, function ( requestData, send ) {
				// will not call callback
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {

					lapin.request( 'v1.reqrestestJoiFail.get', validationData, function ( error, data ) {
						response     = data;
						failResponse = error;
						setTimeout(  done, 1000 );
					} );

				} );
		} );

		it( '-- should receive requestData and bypass callback', function () {

			expect( request ).be.not.exist;

		} );

		it( '-- should return FAIL data', function () {

			expect( failResponse ).be.an( 'object' );
			expect( failResponse.status ).to.exist.and.to.equal( 'fail' );
			expect( failResponse.data ).to.exist;

		} );

		it( '-- should have a null response', function () {

			expect( response ).to.be.an( 'null' );

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
	describe( '- Fail WITHOUT payload -', function () {

		var failData;
		var response;

		before( function ( done ) {
			var payload;
			lapin.request( 'v1.reqrestest.put', payload, function ( error, data ) {
				response = data;
				failData = error;
				done();
			} );
		} );

		it( '-- should have a null response', function () {

			expect( response ).to.be.an( 'null' );

		} );

		it( '-- should received an failData in request', function () {

			expect( failData ).be.an( 'object' );
			expect( failData.status ).to.exist.and.to.equal( 'fail' );
			expect( failData.message ).to.exist.and.to.equal( 'Invalid data' );

		} );

	} );
} );
