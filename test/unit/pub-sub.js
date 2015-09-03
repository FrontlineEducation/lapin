'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */
/* eslint no-underscore-dangle:0 */

var expect = require( 'chai' ).expect;
var rewire = require( 'rewire' );
var PubSub = rewire( process.cwd() + '/lib/pub-sub' );
var helper = require( '../helper' );

describe( 'publish and subscribe', function () {

	describe( 'publisher', function () {
		var Producer;
		var pubSub;
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
		var Consumer;
		var pubSub;
		before( function () {
			pubSub             = new PubSub();
			Consumer           = PubSub.__get__( 'consumer' );
			var consumerHelper = {
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

		it( 'should return an error when invalid messagetType', function ( done ) {
			pubSub.subscribe( [ 'v1.session.get' ], function () {} )
				.on( 'error', function () {
					expect( true ).to.be.true;
					done();
				} );
		} );

	} );
} );

