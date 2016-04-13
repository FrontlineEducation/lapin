'use strict';

/* eslint no-unused-expressions:0 */
/* eslint no-underscore-dangle:0 */

const sinon     = require( 'sinon' );
const rewire    = require( 'rewire' );
const expect    = require( 'chai' ).expect;
const consumer  = rewire( process.cwd() + '/lib/util/consumer' );
const Responder = require( '../../helper' ).Consumer;

describe( 'Consumer util', function () {
	let cache = {};

	const options = {
		'messageType' : 'v1.observation.get'
	};

	const consumerOptions = {
		cache,
		'name' : 'responder'
	};

	let consumerOrig, responder;

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
		const responderCached = consumer.get( options, consumerOptions, sinon.spy() );

		expect( responder ).to.be.equal( responderCached );
	} );
} );
