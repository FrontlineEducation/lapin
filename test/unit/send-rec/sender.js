'use strict';

const expect = require( 'chai' ).expect;
const sinon  = require( 'sinon' );
const Sender = require( process.cwd() + '/lib/send-rec/sender' );

describe( 'Sender', function () {
	let producerStub, producerSpy, Lapin;

	const messageTest = { 'foo' : 'bar' };

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
	} );
} );

