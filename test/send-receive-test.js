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

describe( 'sender / receiver', function () {

	var message = { 'foo' : 'bar' };
	var options = { 'messageType' : 'v1.test.create' };
	var prefix  = 'send-rec.';

	describe( 'sender', function () {

		var sender;

		before( function ( done ) {
			try {
				sender = Lapin.sender( options );
			} catch ( exception ) {
				console.error( exception );
			}
			done();
		} );

		it( 'should be an instance of `Rabbus.Sender`', function ( done ) {
			expect( sender ).to.be.instanceof( Rabbus.Sender );
			done();
		} );

		describe( 'sender constructor', function () {

			it( 'should generate the correct `exchange`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( sender.exchange ).to.equal( prefix + parts[ 1 ] + '-exchange' );
				done();
			} );

			it( 'should generate the correct `messageType`', function ( done ) {
				expect( sender.messageType ).to.equal( prefix + options.messageType );
				done();
			} );

		} );

		describe( 'sender `produce` method', function () {

			var sendStub;

			before( function ( done ) {
				try {
					sender   = Lapin.sender( options );
					sendStub = sinon.stub( sender, 'send', function () {} );
				} catch ( exception ) {
					console.error( exception );
				}
				done();
			} );

			after( function ( done ) {
				sender.send.restore();
				done();
			} );

			it( 'should invoke `send` method', function ( done ) {
				sender.produce( message, function () {} );
				expect( sendStub.callCount ).to.equal( 1 );
				done();
			} );

		} );

	} );

	describe( 'receiver', function () {

		var receiver;

		before( function ( done ) {
			try {
				receiver = Lapin.receiver( options );
			} catch ( exception ) {
				console.error( exception );
			}
			done();
		} );

		it( 'should be an instance of `Rabbus.Receiver`', function ( done ) {
			expect( receiver ).to.be.instanceof( Rabbus.Receiver );
			done();
		} );

		describe( 'receiver constructor', function () {

			it( 'should generate the correct `exchange`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( receiver.exchange ).to.equal( prefix + parts[ 1 ] + '-exchange' );
				done();
			} );

			it( 'should generate the correct `queue`', function ( done ) {
				var parts = options.messageType.split( '.' );
				expect( receiver.queue ).to.equal( prefix + parts[ 1 ] + '-queue' );
				done();
			} );

			it( 'should generate the correct `messageType`', function ( done ) {
				expect( receiver.messageType ).to.equal( prefix + options.messageType );
				done();
			} );

		} );

		describe( 'receiver `consume` method', function () {

			var receiveStub;

			before( function ( done ) {
				try {
					receiver    = Lapin.receiver( options );
					receiveStub = sinon.stub( receiver, 'receive', function () {} );
				} catch ( exception ) {
					console.error( exception );
				}
				done();
			} );

			after( function ( done ) {
				receiver.receive.restore();
				done();
			} );

			it( 'should invoke `receive` method', function ( done ) {
				receiver.consume( function () {} );
				expect( receiveStub.callCount ).to.equal( 1 );
				done();
			} );

		} );

	} );

} );
