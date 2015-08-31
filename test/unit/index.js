'use strict';

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;
var wascally   = require( 'wascally' );
var config     = require( process.cwd() + '/lib/config' );

describe( 'lapin with wascally', function () {

	var lapin;

	before( function () {
		lapin = require( process.cwd() + '/index' )( wascally );
	} );

	it( '-- should have proper attributes', function () {

		expect( lapin ).to.have.property( 'request' );
		expect( typeof lapin.request === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'respond' );
		expect( typeof lapin.respond === 'function' ).to.equal( true );

		expect( lapin ).to.have.property( 'send' );
		expect( typeof lapin.send === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'receive' );
		expect( typeof lapin.receive === 'function' ).to.equal( true );

		expect( lapin ).to.have.property( 'publish' );
		expect( typeof lapin.publish === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'subscribe' );
		expect( typeof lapin.subscribe === 'function' ).to.equal( true );

		expect( lapin ).to.have.property( 'requestPromise' );
		expect( typeof lapin.requestPromise === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'sendPromise' );
		expect( typeof lapin.sendPromise === 'function' ).to.equal( true );

	} );

	it( '-- should return a singleton lapin object', function () {

		var anotherLapin = require( process.cwd() + '/index' )( wascally );
		expect( anotherLapin ).to.equal( lapin );

	} );

} );

describe( 'lapin without passing wascally', function () {

	before( function () {
		requireNew( process.cwd() + '/index' )();
	} );

	it( '-- should use local wascally for rabbit', function () {
		expect( config.rabbit ).equal( wascally );
	} );

} );

describe( 'lapin with wascally wrapped in an object', function () {

	before( function () {
		requireNew( process.cwd() + '/index' )( { 'rabbit' : wascally } );
	} );

	it( '-- should use local wascally for rabbit', function () {
		expect( config.rabbit ).equal( wascally );
	} );

} );
