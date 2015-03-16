'use strict';

var sinon = require( 'sinon' );
var Code  = require( 'code' );
var Lab   = require( 'lab' );

var lab        = exports.lab = Lab.script();
var describe   = lab.describe;
var it         = lab.it;
var before     = lab.before;
var after      = lab.after;
var expect     = Code.expect;
var proxyquire = require( 'proxyquire' );

describe( 'requester and responder', function () {

	describe( 'requester', function () {

		var RabbusStub = {
			'Requester' : function () {}
		};

		var callbackSpy;
		var Lapin;
		var ReqRes;
		var requestSpy;

		var messageTest = { 'foo' : 'bar' };

		var successReply = { 'data' : 'success' };
		var errorReply   = { 'message' : 'Internal Error' };
		var failReply    = { 'data' : 'fail' };

		var relpies = {
			'success' : {
				'status' : 'success',
				'data'   : successReply
			},

			'error' : {
				'status'  : 'error',
				'message' : errorReply.message,
				'data'    : { 'data' : 'error data' }
			},

			'fail' : {
				'status' : 'fail',
				'data'   : failReply
			}
		};

		describe( 'success request', function () {

			before( function ( done ) {
				RabbusStub.Requester.prototype.request = function ( message, reply ) {
					// return a successful reply
					reply( relpies.success );
				};

				ReqRes = proxyquire( '../lib/req-res.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				requestSpy  = sinon.spy( RabbusStub.Requester.prototype, 'request' );
				Lapin       = new ReqRes( {} );

				Lapin.request( 'v1.test.create', messageTest, callbackSpy );

				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				requestSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus with correct message', function ( done ) {
				expect( requestSpy.calledWith( messageTest ) ).to.equal( true );

				done();
			} );

			it( 'should call callback without error', function ( done ) {
				expect( callbackSpy.calledOnce ).to.equal( true );
				expect( callbackSpy.calledWith( null, successReply ) ).to.equal( true );

				done();
			} );

		} );

		describe( 'error request', function () {

			before( function ( done ) {
				RabbusStub.Requester.prototype.request = function ( message, reply ) {
					// return a reply with an error
					reply( relpies.error );
				};

				ReqRes = proxyquire( '../lib/req-res.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				requestSpy  = sinon.spy( RabbusStub.Requester.prototype, 'request' );
				Lapin       = new ReqRes( {} );

				Lapin.request( 'v1.test.create', messageTest, callbackSpy );

				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				requestSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus with correct message', function ( done ) {
				expect( requestSpy.calledWith( messageTest ) ).to.equal( true );

				done();
			} );

			it( 'should call callbackSpy with error', function ( done ) {
				expect( callbackSpy.calledOnce ).to.equal( true );
				expect( callbackSpy.calledWith( errorReply.message, null ) ).to.equal( true );

				done();
			} );

		} );

		describe( 'fail request', function () {

			before( function ( done ) {
				RabbusStub.Requester.prototype.request = function ( message, reply ) {
					// return a reply with an fail
					reply( relpies.fail );
				};

				ReqRes = proxyquire( '../lib/req-res.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				requestSpy  = sinon.spy( RabbusStub.Requester.prototype, 'request' );
				Lapin       = new ReqRes( {} );

				Lapin.request( 'v1.test.create', messageTest, callbackSpy );

				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				requestSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus with correct message', function ( done ) {
				expect( requestSpy.calledWith( messageTest ) ).to.equal( true );

				done();
			} );

			it( 'should call callback with a fail error', function ( done ) {
				expect( callbackSpy.calledOnce ).to.equal( true );
				expect( callbackSpy.calledWith( failReply, null ) ).to.equal( true );

				done();
			} );

		} );

	} );

	describe( 'responder', function () {

		var RabbusStub = {
			'Responder' : function () {}
		};

		var callbackSpy;
		var Lapin;
		var ReqRes;
		var respondSpy;

		describe( 'response', function () {

			before( function ( done ) {

				RabbusStub.Responder.prototype.handle = function ( callback ) {
					// execute the callback
					callback();
				};

				ReqRes = proxyquire( '../lib/req-res.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				respondSpy  = sinon.spy( RabbusStub.Responder.prototype, 'handle' );
				Lapin       = new ReqRes( {} );

				Lapin.respond( 'v1.test.create', callbackSpy );

				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				respondSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus.handle with callback', function ( done ) {
				expect( respondSpy.calledWith( callbackSpy ) ).to.equal( true );

				done();
			} );

			it( 'should call callback only once', function ( done ) {
				expect( callbackSpy.calledOnce ).to.equal( true );

				done();
			} );

		} );

	} );

} );
