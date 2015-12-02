'use strict';

var expect    = require( 'chai' ).expect;
var sinon     = require( 'sinon' );
var Responder = require( process.cwd() + '/lib/req-res/responder' );

describe( 'Responder', function () {

	var Lapin;
	var consumerStub;

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

