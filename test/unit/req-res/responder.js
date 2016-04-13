'use strict';

const expect    = require( 'chai' ).expect;
const sinon     = require( 'sinon' );
const Responder = require( process.cwd() + '/lib/req-res/responder' );

describe( 'Responder', function () {
	let Lapin, consumerStub;

	before( function () {
		Lapin = new Responder( { 'messageType' : 'v1.consumer.verify' } );
	} );

	describe( 'response', function () {
		before( function () {
			consumerStub = sinon.stub( Lapin, 'handle', consumerStub );
			Lapin.consume( sinon.spy() );
		} );

		after( function () {
			consumerStub.restore();
		} );

		it( 'should call consumerStub only once', function () {
			expect( consumerStub.calledOnce ).to.equal( true );
		} );
	} );
} );

