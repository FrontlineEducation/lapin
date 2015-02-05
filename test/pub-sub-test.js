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

describe( 'publisher / subscriber', function () {

	var message = { 'foo' : 'bar' };
	var options = { 'messageType' : 'v1.test.create' };
	var prefix  = 'pub-sub.';

	describe( 'publisher', function () {

		var publisher;

		before( function ( done ) {
			try {
				publisher = Lapin.publisher( options );
			} catch ( exception ) {
				console.error( exception );
			}
			done();
		} );

		it( 'should be an instance of `Rabbus.Publisher`', function ( done ) {
			expect( publisher ).to.be.instanceof( Rabbus.Publisher );
			done();
		} );

		describe( 'publisher constructor', function () {

			it( 'should generate the correct `exchange`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( publisher.exchange ).to.equal( prefix + parts[ 1 ] + '-exchange' );
				done();
			} );

			it( 'should generate the correct `messageType`', function ( done ) {
				expect( publisher.messageType ).to.equal( prefix + options.messageType );
				done();
			} );

		} );

		describe( 'publisher `produce` method', function () {

			var publishStub;

			before( function ( done ) {
				try {
					publisher   = Lapin.publisher( options );
					publishStub = sinon.stub( publisher, 'publish', function () {} );
				} catch ( exception ) {
					console.error( exception );
				}
				done();
			} );

			after( function ( done ) {
				publisher.publish.restore();
				done();
			} );

			it( 'should invoke `publish` method', function ( done ) {
				publisher.produce( message, function () {} );
				expect( publishStub.callCount ).to.equal( 1 );
				done();
			} );

		} );

	} );

	describe( 'subscriber', function () {

		var subscriber;

		before( function ( done ) {
			try {
				subscriber = Lapin.subscriber( options );
			} catch ( exception ) {
				console.error( exception );
			}
			done();
		} );

		it( 'should be an instance of `Rabbus.Subscriber`', function ( done ) {
			expect( subscriber ).to.be.instanceof( Rabbus.Subscriber );
			done();
		} );

		describe( 'subscriber constructor', function () {

			it( 'should generate the correct `exchange`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( subscriber.exchange ).to.equal( prefix + parts[ 1 ] + '-exchange' );
				done();
			} );

			it( 'should generate the correct `queue`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( subscriber.queue ).to.equal( prefix + parts[ 1 ] + '-queue' );
				done();
			} );

			it( 'should generate the correct `messageType`', function ( done ) {
				expect( subscriber.messageType ).to.equal( prefix + options.messageType );
				done();
			} );

		} );

		describe( 'subscriber `consume` method', function () {

			var subscribeStub;

			before( function ( done ) {
				try {
					subscriber    = Lapin.subscriber( options );
					subscribeStub = sinon.stub( subscriber, 'subscribe', function () {} );
				} catch ( exception ) {
					console.error( exception );
				}
				done();
			} );

			after( function ( done ) {
				subscriber.subscribe.restore();
				done();
			} );

			it( 'should invoke `subscribe` method', function ( done ) {
				subscriber.consume( function () {} );
				expect( subscribeStub.callCount ).to.equal( 1 );
				done();
			} );

		} );

	} );

} );
