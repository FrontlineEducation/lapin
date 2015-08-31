'use strict';

var expect     = require( 'chai' ).expect;
var sinon      = require( 'sinon' );
var Subscriber = require( process.cwd() + '/lib/pub-sub/subscriber' );

describe( 'Subscriber', function () {

	var Lapin;
	var consumerStub;

	before( function () {
		Lapin = new Subscriber( { 'messageType' : 'v1.consumer.verify' } );
	} );

	describe( 'subscribe', function () {

		before( function () {
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
