'use strict';

var expect     = require( 'chai' ).expect;
var wascally   = require( 'wascally' );
var requireNew = require( 'require-new' );

describe( 'lapin', function () {

	var lapin;

	before( function () {
		lapin = require( process.cwd() + '/index' )( wascally );
	} );

	it( '-- should have proper attributes', function () {

		// Wascally
		expect( lapin ).to.have.property( 'configure' );
		expect( typeof lapin.configure === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'connections' );
		expect( typeof lapin.connections === 'object' ).to.equal( true );
		expect( lapin ).to.have.property( 'rabbit' );
		expect( typeof lapin.rabbit === 'object' ).to.equal( true );

		// Request-Response
		expect( lapin ).to.have.property( 'request' );
		expect( typeof lapin.request === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'respond' );
		expect( typeof lapin.respond === 'function' ).to.equal( true );

		// Send-Receive
		expect( lapin ).to.have.property( 'send' );
		expect( typeof lapin.send === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'receive' );
		expect( typeof lapin.receive === 'function' ).to.equal( true );

		// Publish-Subscribe
		expect( lapin ).to.have.property( 'publish' );
		expect( typeof lapin.publish === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'subscribe' );
		expect( typeof lapin.subscribe === 'function' ).to.equal( true );

		// Request and Send Promises
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

describe( 'lapin no wascally', function () {

	var lapin;

	before( function () {
		// Require a non-cached version
		lapin = requireNew( process.cwd() + '/index' )();
	} );

	it( '-- should have proper attributes', function () {

		// Wascally
		expect( lapin ).to.have.property( 'configure' );
		expect( typeof lapin.configure === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'connections' );
		expect( typeof lapin.connections === 'object' ).to.equal( true );
		expect( lapin ).to.have.property( 'rabbit' );
		expect( typeof lapin.rabbit === 'object' ).to.equal( true );

		// Request-Response
		expect( lapin ).to.have.property( 'request' );
		expect( typeof lapin.request === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'respond' );
		expect( typeof lapin.respond === 'function' ).to.equal( true );

		// Send-Receive
		expect( lapin ).to.have.property( 'send' );
		expect( typeof lapin.send === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'receive' );
		expect( typeof lapin.receive === 'function' ).to.equal( true );

		// Publish-Subscribe
		expect( lapin ).to.have.property( 'publish' );
		expect( typeof lapin.publish === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'subscribe' );
		expect( typeof lapin.subscribe === 'function' ).to.equal( true );

		// Request and Send Promises
		expect( lapin ).to.have.property( 'requestPromise' );
		expect( typeof lapin.requestPromise === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'sendPromise' );
		expect( typeof lapin.sendPromise === 'function' ).to.equal( true );

	} );

} );

describe( 'lapin options.rabbit = wascally', function () {

	var lapin;

	before( function () {
		// Require a non-cached version
		lapin = requireNew( process.cwd() + '/index' )( { 'rabbit' : wascally } );
	} );

	it( '-- should have proper attributes', function () {

		// Wascally
		expect( lapin ).to.have.property( 'configure' );
		expect( typeof lapin.configure === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'connections' );
		expect( typeof lapin.connections === 'object' ).to.equal( true );
		expect( lapin ).to.have.property( 'rabbit' );
		expect( typeof lapin.rabbit === 'object' ).to.equal( true );

		// Request-Response
		expect( lapin ).to.have.property( 'request' );
		expect( typeof lapin.request === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'respond' );
		expect( typeof lapin.respond === 'function' ).to.equal( true );

		// Send-Receive
		expect( lapin ).to.have.property( 'send' );
		expect( typeof lapin.send === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'receive' );
		expect( typeof lapin.receive === 'function' ).to.equal( true );

		// Publish-Subscribe
		expect( lapin ).to.have.property( 'publish' );
		expect( typeof lapin.publish === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'subscribe' );
		expect( typeof lapin.subscribe === 'function' ).to.equal( true );

		// Request and Send Promises
		expect( lapin ).to.have.property( 'requestPromise' );
		expect( typeof lapin.requestPromise === 'function' ).to.equal( true );
		expect( lapin ).to.have.property( 'sendPromise' );
		expect( typeof lapin.sendPromise === 'function' ).to.equal( true );

	} );

} );
