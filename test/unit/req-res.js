'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */
/* eslint no-underscore-dangle:0 */

var expect = require( 'chai' ).expect;
var rewire = require( 'rewire' );
var ReqRes = rewire( process.cwd() + '/lib/req-res' );
var helper = require( '../helper' );

describe( 'request and respond', function () {

	describe( 'requester', function () {
		var Producer;
		var reqRes;
		before( function () {
			reqRes   = new ReqRes();
			Producer = ReqRes.__get__( 'Requester' );
			ReqRes.__set__( 'Requester', helper.Producer );
		} );

		after( function () {
			ReqRes.__set__( 'Requester', Producer );
		} );

		it( 'should accept a string', function ( done ) {
			reqRes.request( 'v1.sessions.get', { 'token' : '123' }, function ( data ) {
				expect( data.token ).to.equal( '123' );
				done();
			} );
		} );

		it( 'should accept an object option', function ( done ) {
			reqRes.request( { 'messageType' : 'v1.session.get' }, { 'token' : '123' }, function ( data ) {
				expect( data.token ).to.equal( '123' );
				done();
			} );
		} );

	} );

	describe( 'responder', function () {
		var Consumer;
		var reqRes;

		before( function () {
			reqRes   = new ReqRes();
			Consumer = ReqRes.__get__( 'consumer' );
			var consumerHelper = {
				'get' : helper.getNewConsumer
			};

			ReqRes.__set__( 'consumer', consumerHelper );
		} );

		after( function () {
			ReqRes.__set__( 'consumer', Consumer );
		} );

		it( 'should accept a string', function ( done ) {
			reqRes.respond( 'v1.sessions.get', function ( data ) {
				expect( data ).to.equal( 'done' );
				done();
			} );
		} );

		it( 'should accept an object option', function ( done ) {
			reqRes.respond( { 'messageType' : 'v1.session.get' }, function ( data ) {
				expect( data ).to.equal( 'done' );
				done();
			} );
		} );

		it( 'should return an error when invalid messagetType', function ( done ) {
			reqRes.respond( [ 'v1.session.get' ], function () {} )
				.on( 'error', function () {
					expect( true ).to.be.true;
					done();
				} );
		} );

	} );
} );

