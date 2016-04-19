'use strict';

const expect   = require( 'chai' ).expect;
const sinon    = require( 'sinon' );
const Receiver = require( process.cwd() + '/lib/send-rec/receiver' );

describe( 'Receiver', function () {
	let Lapin, consumerStub;

	before( function () {
		Lapin = new Receiver( { 'messageType' : 'v1.consumer.verify' } );
	} );

	describe( 'receive', function () {
		before( function () {
			consumerStub = sinon.stub( Lapin, 'receive', consumerStub );
			Lapin.consume( sinon.spy() );
		} );

		after( function () {
			consumerStub.restore();
		} );

		it( 'should call cosumer only once', function () {
			expect( consumerStub.calledOnce ).to.equal( true );
		} );
	} );

	describe( 'receive emit error', function () {
		const spy = sinon.spy( console, 'log' );

		before( function () {
			consumerStub = sinon.stub( Lapin, 'receive', consumerStub );
			Lapin.consume( sinon.spy() );
			Lapin.emit( 'error' );
		} );

		after( function () {
			consumerStub.restore();
			spy.reset();
		} );

		it( 'should call cosumer only once', function () {
			expect( consumerStub.calledOnce ).to.equal( true );
			expect( spy.called ).to.equal( true );
		} );
	} );
} );
