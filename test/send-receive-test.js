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

describe( 'send and receive', function () {

	describe( 'sender', function () {

		var RabbusStub = {
			'Sender' : function () {}
		};

		var callbackSpy;
		var Lapin;
		var ReqRes;
		var produceSpy;

		var messageTest = { 'foo' : 'bar' };

		var replies = {
			'success' : {
				'status'  : 'success',
				'message' : 'message sent'
			}
		};

		describe( 'send', function () {

			before( function ( done ) {

				RabbusStub.Sender.prototype.send = function ( message, reply ) {
					// execute the callback
					reply( replies.success );
				};

				ReqRes = proxyquire( '../lib/send-receive.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				produceSpy  = sinon.spy( RabbusStub.Sender.prototype, 'send' );
				Lapin       = new ReqRes( {} );

				Lapin.send( 'v1.log.create', messageTest, callbackSpy );

				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				produceSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus.handle with callback', function ( done ) {
				expect( produceSpy.calledWith( messageTest ) ).to.equal( true );

				done();
			} );

			it( 'should call callback only once', function ( done ) {
				expect( callbackSpy.calledOnce ).to.equal( true );
				done();
			} );

		} );

	} );

	describe( 'receiver', function () {

		var RabbusStub = {
			'Receiver' : function () {}
		};

		var callbackSpy;
		var Lapin;
		var ReqRes;
		var respondSpy;

		describe( 'receive', function () {

			before( function ( done ) {

				RabbusStub.Receiver.prototype.receive = function ( callback ) {
					// execute the callback
					callback();
				};

				ReqRes = proxyquire( '../lib/send-receive.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				respondSpy  = sinon.spy( RabbusStub.Receiver.prototype, 'receive' );
				Lapin       = new ReqRes( {} );

				Lapin.receive( 'v1.log.create', callbackSpy );
				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				respondSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus.receive with callback', function ( done ) {
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
