'use strict';

var sinon  = require( 'sinon' );
var Code   = require( 'code' );
var Lab    = require( 'lab' );
var Rabbit = require( 'wascally' );

var lab    = exports.lab = Lab.script();
var expect = Code.expect;
var pubSub = require( '../lib/pub-sub.js' )( Rabbit );

lab.experiment( 'Publish/Subscribe', function () {
	var msg         = { 'foo' : 'bar' };
	var prefix      = 'pub-sub';
	var messageType = 'v1.test.create';

	lab.experiment( 'Publish', function () {
		var Publisher;
		var stubPub;
		lab.before( function ( done ) {
			try {
				Publisher = new pubSub.Publisher( messageType, msg );
				stubPub   = sinon.stub( Publisher, 'publish' ).returns( 1 );
				Publisher.produce( sinon.spy() );
			} catch ( e ) {
				console.error( e );
			}
			done();
		} );

		lab.test( 'should invoked publish method', function ( done ) {
			expect( stubPub.callCount ).above( 0 );
			done();
		} );

		lab.test( 'should adhere to agreed standard `messageType`', function ( done ) {
			var msgType = Publisher.messageType.split( '.' );
			expect( prefix ).to.be.equal( msgType[ 0 ] );
			expect( Publisher.messageType ).to.be.equal( prefix + '.' + messageType );
			done();
		} );

		lab.test( 'should adhere to agreed standard `exchange`', function ( done ) {
			var exchange = Publisher.exchange.split( '.' );
			expect( prefix ).to.be.equal( exchange[ 0 ] );
			expect( exchange.length ).to.be.equal( 2 );
			done();
		} );
	} );

	lab.experiment( 'Subscribe', function () {
		var Subscriber;
		var stubSub;
		lab.before( function ( done ) {
			try {
				Subscriber = new pubSub.Subscriber( messageType, msg );
				stubSub    = sinon.stub( Subscriber, 'subscribe' ).returns( 1 );
				Subscriber.consume( sinon.spy() );
			} catch ( e ) {
				console.error( e );
			}
			done();
		} );

		lab.test( 'should invoked publish method' , function ( done ) {
			expect( stubSub.callCount ).above( 0 );
			done();
		} );

		lab.test( 'should adhere to agreed standard `messageType`' , function ( done ) {
			var msgType = Subscriber.messageType.split( '.' );
			expect( prefix ).to.be.equal( msgType[ 0 ] );
			expect( Subscriber.messageType ).to.be.equal( prefix + '.' + messageType );
			done();
		} );

		lab.test( 'should adhere to agreed standard `exchange`', function ( done ) {
			var exchange = Subscriber.exchange.split( '.' );
			expect( prefix ).to.be.equal( exchange[ 0 ] );
			expect( exchange.length ).to.be.equal( 2 );
			done();
		} );
	} );

} );
