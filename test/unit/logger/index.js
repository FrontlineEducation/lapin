'use strict';

/* eslint no-unused-expressions:0 */

const expect        = require( 'chai' ).expect;
const Logger        = require( process.cwd() + '/lib/logger' );
const EventEmitter  = require( 'events' ).EventEmitter;
const DummyLogger   = require( process.cwd() + '/lib/logger/dummylogger' )();

describe( 'Logger - index', function () {
	describe( '- Dummy Logger -', function () {
		let logger;

		before( function () {
			logger = new Logger();
		} );

		it( '-- should return a dummy logger', function () {
			for ( let property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( DummyLogger[ property ] );
				}
			}
		} );
	} );

	describe( '- Function Logger -', function () {
		const config = require( process.cwd() + '/lib/config' );
		let logger;

		before( function () {
			config.logger = console.log;
			logger        = new Logger( {
				'emitter' : new EventEmitter()
			} );
		} );

		it( '-- should return a function logger', function () {
			for ( let property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( console.log );
				}
			}
		} );
	} );

	describe( '- Object Logger -', function () {
		const config = require( process.cwd() + '/lib/config' );
		let logger;

		before( function () {
			config.logger = {
				info () {},
				error () {},
				warn () {},
				verbose () {},
				debug () {},
				silly () {}
			};

			logger = new Logger( {
				'emitter' : new EventEmitter()
			} );
		} );

		it( '-- should return an object logger', function () {
			for ( let property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( config.logger[ property ] );
				}
			}
		} );
	} );

	describe( '- Default Logger -', function () {
		const config        = require( process.cwd() + '/lib/config' );
		const DefaultLogger = require( process.cwd() + '/lib/logger/defaultlogger' );
		const emitter       = new EventEmitter();
		let logger;

		before( function () {
			config.logger = null;
			logger        = new Logger( {
				emitter
			} );
		} );

		it( '-- should return a default logger', function () {
			const defaultLogger = new DefaultLogger( {
				emitter
			} );

			for ( let property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( defaultLogger[ property ] );
				}
			}
		} );
	} );
} );
