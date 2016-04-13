'use strict';

const expect     = require( 'chai' ).expect;
const sinon      = require( 'sinon' );
const Subscriber = require( process.cwd() + '/lib/pub-sub/subscriber' );

describe( 'Subscriber', function () {
	let Lapin, consumerStub;

	describe( 'subscribe', function () {
		before( function () {
			Lapin        = new Subscriber( { 'messageType' : 'v1.consumer.verify' } );
			consumerStub = sinon.stub( Lapin, 'subscribe', consumerStub );
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
