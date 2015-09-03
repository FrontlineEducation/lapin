'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */
/* eslint no-underscore-dangle:0 */

var sinon     = require( 'sinon' );
var rewire    = require( 'rewire' );
var expect    = require( 'chai' ).expect;
var consumer  = rewire( process.cwd() + '/lib/util/consumer' );
var Responder = require( '../../helper' ).Consumer;

describe( 'Consumer util', function () {

	var options = {
		'messageType' : 'v1.observation.get'
	};

	var cache           = {};
	var consumerOptions = {
		'name'  : 'responder',
		'cache' : cache
	};

	var consumerOrig;
	var responder;

	before( function () {
		consumerOrig = consumer.__get__( 'Responder' );
		consumer.__set__( 'Responder', Responder );
	} );

	after( function () {
		consumer.__set__( 'Responder', consumerOrig );
	} );

	it( 'should have proper attributes', function () {
		expect( consumer.get ).to.exist;
		expect( consumer.getNew ).to.exist;
		expect( consumer.getCached ).to.exist;
		expect( consumer.getCollection ).to.exist;
	} );

	it( 'should return new responder', function () {
		responder = consumer.get( options, consumerOptions, sinon.spy() );
		expect( responder ).to.be.instanceof( Responder );
	} );

	it( 'should return cached responder', function () {
		var responderCached = consumer.get( options, consumerOptions, sinon.spy() );
		expect( responder ).to.be.equal( responderCached );
	} );

} );
