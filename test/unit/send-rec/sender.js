'use strict';

var expect = require( 'chai' ).expect;
var sinon  = require( 'sinon' );
var Sender = require( process.cwd() + '/lib/send-rec/sender' );

describe( 'Sender', function () {

	var producerStub;
	var producerSpy;
	var Lapin;

	var messageTest = { 'foo' : 'bar' };

	before( function () {
		Lapin = new Sender( { 'messageType' : 'v1.consumer.verify' } );
	} );

	describe( 'sender', function () {

		before( function () {
			producerSpy  = sinon.spy();
			producerStub = sinon.stub( Lapin, 'send', producerSpy );
			Lapin.produce( messageTest, sinon.spy() );
		} );

		after( function () {
			producerStub.restore();
		} );

		it( 'should should call Rabbus.send with callback', function () {
			expect( producerStub.calledWith( messageTest ) ).to.equal( true );
		} );

		it( 'should call producerSpy only once', function () {
			expect( producerSpy.calledOnce ).to.equal( true );
		} );

		it( 'should emit error when option is invalid', function ( done ) {
			var LapinError = new Sender( { 'messageType' : 'v1.consu' } );
			LapinError
				.on( 'error', function ( error ) {
					console.log( error );
					expect( error ).to.be.instanceof( Error );
					done();
				} );
		} );
	} );

} );

