'use strict';

/* eslint no-unused-expressions:0 */
/* eslint no-underscore-dangle:0 */

const expect = require( 'chai' ).expect;
const rewire = require( 'rewire' );
const PubSub = rewire( process.cwd() + '/lib/pub-sub' );
const helper = require( '../helper' );

describe( 'publish and subscribe', function () {
	describe( 'publisher', function () {
		let Producer, pubSub;

		before( function () {
			pubSub   = new PubSub();
			Producer = PubSub.__get__( 'Publisher' );
			PubSub.__set__( 'Publisher', helper.Producer );
		} );

		after( function () {
			PubSub.__set__( 'Publisher', Producer );
		} );

		it( 'should accept a string', function ( done ) {
			pubSub.publish( 'v1.sessions.get', { 'token' : '123' }, function ( data ) {
				expect( data.token ).to.equal( '123' );
				done();
			} );
		} );

		it( 'should accept a object option', function ( done ) {
			pubSub.publish( { 'messageType' : 'v1.session.get' }, { 'token' : '123' }, function ( data ) {
				expect( data.token ).to.equal( '123' );
				done();
			} );
		} );
	} );

	describe( 'subscriber', function () {
		let Consumer, pubSub;

		before( function () {
			pubSub             = new PubSub();
			Consumer           = PubSub.__get__( 'consumer' );

			const consumerHelper = {
				'get' : helper.getNewConsumer
			};

			PubSub.__set__( 'consumer', consumerHelper );
		} );

		after( function () {
			PubSub.__set__( 'consumer', Consumer );
		} );

		it( 'should accept a string', function ( done ) {
			pubSub.subscribe( 'v1.sessions.get', function ( data ) {
				expect( data ).to.equal( 'done' );
				done();
			} );
		} );

		it( 'should accept a object option', function ( done ) {
			pubSub.subscribe( { 'messageType' : 'v1.session.get' }, function ( data ) {
				expect( data ).to.equal( 'done' );
				done();
			} );
		} );
	} );
} );

