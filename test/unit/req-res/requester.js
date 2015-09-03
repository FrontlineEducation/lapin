'use strict';

var expect    = require( 'chai' ).expect;
var sinon     = require( 'sinon' );
var Requester = require( process.cwd() + '/lib/req-res/requester' );

describe( 'Requester', function () {

	var callbackSpy;
	var Lapin;
	var requestStub;

	var messageTest = { 'foo' : 'bar' };

	var replies = {
		'success' : {
			'status' : 'success',
			'data'   : { 'data' : 'success' }
		},

		'error' : {
			'status'  : 'error',
			'message' : 'Internal Error',
			'data'    : { 'data' : 'error data' }
		},

		'fail' : {
			'status' : 'fail',
			'data'   : { 'data' : 'fail' }
		}
	};

	before( function () {
		callbackSpy = sinon.spy();
		Lapin       = new Requester( { 'messageType' : 'v1.consumer.verify' } );
	} );

	describe( 'requester', function () {

		describe( 'success request', function () {

			var stubRequest = function ( message, reply ) {
				// return a successful reply
				reply( replies.success );
			};

			before( function () {
				// stub
				requestStub = sinon.stub( Lapin, 'request', stubRequest );
				Lapin.produce( messageTest, callbackSpy );
			} );

			after( function () {
				requestStub.restore();
				callbackSpy.reset();
			} );

			it( 'should should call Rabbus with correct message', function ( done ) {
				expect( requestStub.calledWith( messageTest ) ).to.equal( true );

				done();
			} );

			it( 'should call callback without error', function ( done ) {
				expect( callbackSpy.calledOnce ).to.equal( true );
				expect( callbackSpy.calledWith( null, replies.success ) ).to.equal( true );

				done();
			} );

		} );
	} );

	describe( 'error request', function () {

		var stubRequest = function ( message, reply ) {
			// return a successful reply
			reply( replies.error );
		};

		before( function () {
			// stub
			requestStub = sinon.stub( Lapin, 'request', stubRequest );
			Lapin.produce( messageTest, callbackSpy );
		} );

		after( function () {
			callbackSpy.reset();
			requestStub.restore();
		} );

		it( 'should should call Rabbus with correct message', function () {
			expect( requestStub.calledWith( messageTest ) ).to.equal( true );
		} );

		it( 'should call callbackSpy with error', function () {
			expect( callbackSpy.calledOnce ).to.equal( true );
			expect( callbackSpy.calledWith( replies.error, null ) ).to.equal( true );
		} );

	} );

	describe( 'fail request', function () {

		var stubRequest = function ( message, reply ) {
			// return a successful reply
			reply( replies.fail );
		};

		before( function () {
			// stub
			requestStub = sinon.stub( Lapin, 'request', stubRequest );
			Lapin.produce( messageTest, callbackSpy );
		} );

		after( function () {
			callbackSpy.reset();
			requestStub.restore();
		} );

		it( 'should should call Rabbus with correct message', function ( done ) {
			expect( requestStub.calledWith( messageTest ) ).to.equal( true );

			done();
		} );

		it( 'should call callback with a fail error', function ( done ) {
			expect( callbackSpy.calledOnce ).to.equal( true );
			expect( callbackSpy.calledWith( replies.fail, null ) ).to.equal( true );

			done();
		} );
	} );

	it( 'should emit error when option is invalid', function ( done ) {
		var LapinError = new Requester( { 'messageType' : 'v1.consu' } );
		LapinError
			.on( 'error', function ( error ) {
				console.log( error );
				expect( error ).to.be.instanceof( Error );
				done();
			} );
	} );
} );

