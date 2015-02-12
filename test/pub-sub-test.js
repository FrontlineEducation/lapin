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

describe( 'publish and subscribe', function () {

	describe( 'publisher', function () {

		var RabbusStub = {
			'Publisher' : function () {}
		};

		var callbackSpy;
		var Lapin;
		var ReqRes;
		var produceSpy;

		var messageTest = { 'foo' : 'bar' };

		var relpies = {
			'success' : {
				'status'  : 'success',
				'message' : 'message sent'
			}
		};

		describe( 'publish', function () {

			before( function ( done ) {

				RabbusStub.Publisher.prototype.publish = function ( message, reply ) {
					// execute the callback
					reply( relpies.success );
				};

				ReqRes = proxyquire( '../lib/pub-sub.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				produceSpy  = sinon.spy( RabbusStub.Publisher.prototype, 'publish' );
				Lapin       = new ReqRes( {} );

				Lapin.publish( 'v1.log.create', messageTest, callbackSpy );

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

	describe( 'subscriber', function () {

		var RabbusStub = {
			'Subscriber' : function () {}
		};

		var callbackSpy;
		var Lapin;
		var ReqRes;
		var respondSpy;

		describe( 'subscribe', function () {

			before( function ( done ) {

				RabbusStub.Subscriber.prototype.subscribe = function ( callback ) {
					// execute the callback
					callback();
				};

				ReqRes = proxyquire( '../lib/pub-sub.js', {
					'rabbus' : RabbusStub
				} );

				callbackSpy = sinon.spy();
				respondSpy  = sinon.spy( RabbusStub.Subscriber.prototype, 'subscribe' );
				Lapin       = new ReqRes( {} );

				Lapin.subscribe( 'v1.log.create', callbackSpy );

				done();
			} );

			after( function ( done ) {
				callbackSpy = undefined;
				Lapin       = undefined;
				ReqRes      = undefined;
				respondSpy  = undefined;

				done();
			} );

			it( 'should should call Rabbus.subscribe with callback', function ( done ) {
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
