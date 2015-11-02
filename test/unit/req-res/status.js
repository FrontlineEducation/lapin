'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect  = require( 'chai' ).expect;
var Emitter = require( 'events' ).EventEmitter;

describe( 'Status', function () {

	var status;
	var response;

	before( function () {
		var respond = function ( data ) {
			response = data;
		};

		status = require( process.cwd() + '/lib/req-res/status' )( {
			'respond' : respond,
			'log'     : require( process.cwd() + '/lib/logger' )( {
				'emitter' : new Emitter()
			} )
		} );
	} );

	it( 'should return success data', function () {
		var data = { 'user' : 'testfoo' };
		status.success( data );

		expect( response ).to.have.property( 'status' );
		expect( response ).to.have.property( 'data' );

		expect( response.status ).to.equal( 'success' );
		expect( response.data ).to.equal( data );
	} );

	it( 'should return error data w/ message, errorData and code', function () {
		var error = new Error( 'Internal Server Error' );

		status.error( error.message, error, 404 );

		expect( response ).to.have.property( 'status' );
		expect( response ).to.have.property( 'message' );
		expect( response ).to.have.property( 'data' );
		expect( response ).to.have.property( 'code' );

		expect( response.status ).to.equal( 'error' );
		expect( response.data ).to.equal( error );
		expect( response.message ).to.equal( error.message );
		expect( response.code ).to.equal( 404 );
	} );

	it( 'should return error data w/ message', function () {
		var error = 'Internal Server Error';

		status.error( 'Internal Server Error' );

		expect( response ).to.have.property( 'status' );
		expect( response ).to.have.property( 'message' );
		expect( response ).to.have.property( 'data' );
		expect( response ).to.have.property( 'code' );

		expect( response.status ).to.equal( 'error' );
		expect( response.data ).to.be.an.Object;
		expect( response.message ).to.equal( error );
		expect( response.code ).to.equal( 0 );
	} );

	it( 'should return fail data', function () {
		var data = 'Invalid data';
		status.fail( data );

		expect( response ).to.have.property( 'status' );
		expect( response ).to.have.property( 'data' );

		expect( response.status ).to.equal( 'fail' );
		expect( response.data ).to.equal( data );
	} );

} );
