'use strict';

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;
const config     = require( process.cwd() + '/lib/config' );

describe( 'lapin with rabbot', function () {
	const rabbot = requireNew( 'rabbot' );

	let lapin;

	before( function () {
		lapin = require( process.cwd() )( rabbot );
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
		const anotherLapin = require( process.cwd() )( rabbot );

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

describe( 'lapin as object with rabbot without logger', function () {
	const rabbot = requireNew( 'rabbot' );

	before( function () {
		requireNew( process.cwd() + '/index' )( { 'rabbit' : rabbot } );
	} );

	it( '-- should use the same rabbit', function () {
		expect( config.rabbit ).equal( rabbot );
	} );
} );

describe( 'lapin with logger as options without rabbot', function () {
	it( '-- should throw error', function () {
		try {
			requireNew( process.cwd() + '/index' )( { 'logger' : console.log } );
		} catch ( error ) {
			expect( error ).to.be.instanceof( Error );
		}
	} );
} );

describe( 'lapin with logger and rabbot', function () {
	const rabbit = requireNew( 'rabbot' );

	before( function () {
		requireNew( process.cwd() + '/index' )( {
			rabbit,
			'logger' : console.log
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
				'opts'   : 'opts',
				'logger' : console.log
			} );
		} catch ( error ) {
			expect( error ).to.be.instanceof( Error );
		}
	} );
} );

describe( 'lapin with rabbit with other options', function () {
	const rabbit = requireNew( 'rabbot' );

	before( function () {
		requireNew( process.cwd() + '/index' )( {
			rabbit,
			'opts' : 'opts',
			'log'  : console.log
		} );
	} );

	it( '-- should have the same rabbit', function () {
		expect( config.rabbit ).to.equal( rabbit );
	} );
} );
