'use strict';

var expect     = require( 'chai' ).expect;
var sinon      = require( 'sinon' );
var Subscriber = require( process.cwd() + '/lib/pub-sub/subscriber' );

describe( 'Subscriber', function () {

	var Lapin;
	var consumerStub;

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

		it( 'should emit error when option is invalid', function ( done ) {
			var LapinError = new Subscriber( { 'messageType' : 'v1.consu' } );
			LapinError
				.on( 'error', function ( error ) {
					console.log( error );
					expect( error ).to.be.instanceof( Error );
					done();
				} );
		} );
	} );

} );
