'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var EventEmitter = require( 'events' ).EventEmitter;
var expect       = require( 'chai' ).expect;
var Collection   = require( process.cwd() + '/lib/collection/responder-collection' );
var helper       = require( process.cwd() + '/test/helper' );

describe( 'Responder Collection', function () {
	var collection = new Collection();
	var responder  = new helper.Consumer();

	it( 'should be an instanceof EventEmitter', function () {
		expect( collection ).to.be.instanceof( EventEmitter );
	} );

	it( 'should have have proper attribute(s) and method(s)', function () {

		expect( collection ).to.have.property( 'responders' );
		expect( collection.add ).to.exist;
		expect( collection.consume ).to.exits;

	} );

	it( 'should not be able to add responders', function () {
		collection.add( responder );
		expect( collection.length() ).to.be.equal( 1 );
	} );

	it( 'should be to start events and listen to ready when consumed', function ( done ) {
		// todo: catch error couldn't make it work
		collection.consume( function () {} );
		collection.on( 'ready', function () {
				expect( true ).to.be.true;
				done();
			} );
	} );

} );
