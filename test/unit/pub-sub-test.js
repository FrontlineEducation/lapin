'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect     = require( 'chai' ).expect;
var sinon      = require( 'sinon' );
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

		var replies = {
			'success' : {
				'status'  : 'success',
				'message' : 'message sent'
			}
		};

		describe( 'publish', function () {

			before( function ( done ) {

				RabbusStub.Publisher.prototype.once           = function () {};
				RabbusStub.Publisher.prototype.removeListener = function () {};
				RabbusStub.Publisher.prototype.publish        = function ( message, reply ) {
					// execute the callback
					reply( replies.success );
				};

				ReqRes = proxyquire( process.cwd() + '/lib/pub-sub.js', {
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

				ReqRes = proxyquire( process.cwd() + '/lib/pub-sub.js', {
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
