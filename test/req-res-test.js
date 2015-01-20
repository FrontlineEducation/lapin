'use strict';

var sinon = require( 'sinon' );
var Code  = require( 'code' );
var Lab   = require( 'lab' );

/*global describe:true it:true before:true after:true*/
/*jshint -W079*/
var lab      = exports.lab = Lab.script();
var describe = lab.describe;
var it       = lab.it;
var before   = lab.before;
var after    = lab.after;
var expect   = Code.expect;

var Rabbus = require( 'rabbus' );
var Rabbit = require( 'wascally' );
var Lapin  = require( '../' )( Rabbit );

describe( 'requester / responder', function () {

	var message = { 'foo' : 'bar' };
	var options = { 'messageType' : 'v1.test.create' };
	var prefix  = 'req-res.';

	describe( 'requester', function () {

		var requester;

		before( function ( done ) {
			try {
				requester = new Lapin.Requester( options );
			} catch ( exception ) {
				console.error( exception );
			}
			done();
		} );

		it( 'should be an instance of `Rabbus.Requester`', function ( done ) {
			expect( requester ).to.be.instanceof( Rabbus.Requester );
			done();
		} );

		describe( 'requester constructor', function () {

			it( 'should generate the correct `exchange`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( requester.exchange ).to.equal( prefix + parts[ 1 ] + '-exchange' );
				done();
			} );

			it( 'should generate the correct `messageType`', function ( done ) {
				expect( requester.messageType ).to.equal( prefix + options.messageType );
				done();
			} );

		} );

		describe( 'requester `produce` method', function () {

			var requestStub;

			before( function ( done ) {
				try {
					requester   = new Lapin.Requester( options );
					requestStub = sinon.stub( requester, 'request', function () {} );
				} catch ( exception ) {
					console.error( exception );
				}
				done();
			} );

			after( function ( done ) {
				requester.request.restore();
				done();
			} );

			it( 'should invoke `request` method', function ( done ) {
				requester.produce( message, function () {} );
				expect( requestStub.callCount ).to.equal( 1 );
				done();
			} );

		} );

	} );

	describe( 'responder', function () {

		var responder;

		before( function ( done ) {
			try {
				responder = new Lapin.Responder( options );
			} catch ( exception ) {
				console.error( exception );
			}
			done();
		} );

		it( 'should be an instance of `Rabbus.Responder`', function ( done ) {
			expect( responder ).to.be.instanceof( Rabbus.Responder );
			done();
		} );

		describe( 'responder constructor', function () {

			it( 'should generate the correct `exchange`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( responder.exchange ).to.equal( prefix + parts[ 1 ] + '-exchange' );
				done();
			} );

			it( 'should generate the correct `queue`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( responder.queue ).to.equal( prefix + parts[ 1 ] + '-queue' );
				done();
			} );

			it( 'should generate the correct `messageType`', function ( done ) {
				expect( responder.messageType ).to.equal( prefix + options.messageType );
				done();
			} );

		} );

		describe( 'responder `consume` method', function () {

			var handleStub;

			before( function ( done ) {
				try {
					responder  = new Lapin.Responder( options );
					handleStub = sinon.stub( responder, 'handle', function () {} );
				} catch ( exception ) {
					console.error( exception );
				}
				done();
			} );

			after( function ( done ) {
				responder.handle.restore();
				done();
			} );

			it( 'should invoke `handle` method', function ( done ) {
				responder.consume( function () {} );
				expect( handleStub.callCount ).to.equal( 1 );
				done();
			} );

		} );

	} );

} );
