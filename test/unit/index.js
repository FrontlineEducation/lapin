'use strict';

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;
var config     = require( process.cwd() + '/lib/config' );

describe( 'lapin with wascally', function () {

	var lapin;
	var wascally = requireNew( 'wascally' );

	before( function () {
		lapin = require( process.cwd() )( wascally );
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

		var anotherLapin = require( process.cwd() )( wascally );
		expect( anotherLapin ).to.equal( lapin );

	} );

} );

describe( 'lapin with no options', function () {

	it( '-- should throw an error', function () {
		try {
			requireNew( process.cwd() + '/index' )();
		} catch ( error ) {
			expect( error ).to.be.instanceof( Error );
		}
	} );

} );

describe( 'lapin as object with wascally without logger', function () {

	var wascally = requireNew( 'wascally' );
	before( function () {
		requireNew( process.cwd() + '/index' )( { 'rabbit' : wascally } );
	} );

	it( '-- should use the same rabbit', function () {
		expect( config.rabbit ).equal( wascally );
	} );

} );

describe( 'lapin with logger as options without wascally', function () {

	it( '-- should throw error', function () {
		try {
			requireNew( process.cwd() + '/index' )( { 'logger' : console.log } );
		} catch ( error ) {
			expect( error ).to.be.instanceof( Error );
		}
	} );

} );

describe( 'lapin with logger and wascally', function () {

	var rabbit = requireNew( 'wascally' );
	before( function () {
		requireNew( process.cwd() + '/index' )( {
			'logger' : console.log,
			'rabbit' : rabbit
		} );
	} );

	it( '-- should throw error', function () {
		expect( config.logger ).to.equal( console.log );
		expect( config.rabbit ).to.equal( rabbit );
	} );

} );

describe( 'lapin with other options only logger', function () {

	it( '-- should throw error', function () {
		try {
			requireNew( process.cwd() + '/index' )( {
				'logger' : console.log,
				'opts'   : 'opts'
			} );
		} catch ( error ) {
			expect( error ).to.be.instanceof( Error );
		}
	} );

} );

describe( 'lapin with rabbit with other options', function () {

	var rabbit = requireNew( 'wascally' );
	before( function () {
		requireNew( process.cwd() + '/index' )( {
			'log'    : console.log,
			'rabbit' : rabbit,
			'opts'   : 'opts'
		} );
	} );

	it( '-- should have the same rabbit', function () {
		expect( config.rabbit ).to.equal( rabbit );
	} );

} );
