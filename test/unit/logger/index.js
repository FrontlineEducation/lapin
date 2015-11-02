'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect        = require( 'chai' ).expect;
var Logger        = require( process.cwd() + '/lib/logger' );
var EventEmitter  = require( 'events' ).EventEmitter;
var DummyLogger   = require( process.cwd() + '/lib/logger/dummylogger' )();

describe( 'Logger - index', function () {

	describe( '- Dummy Logger -', function () {

		var logger;
		before( function () {
			logger = new Logger();
		} );

		it( '-- should return a dummy logger', function () {
			for ( var property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( DummyLogger[ property ] );
				}
			}
		} );

	} );

	describe( '- Function Logger -', function () {

		var logger;
		var config = require( process.cwd() + '/lib/config' );

		before( function () {
			config.logger = console.log;
			logger        = new Logger( {
				'emitter' : new EventEmitter()
			} );
		} );

		it( '-- should return a function logger', function () {
			for ( var property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( console.log );
				}
			}
		} );

	} );

	describe( '- Object Logger -', function () {

		var logger;
		var config = require( process.cwd() + '/lib/config' );

		before( function () {
			config.logger = {
				'info'    : function () {},
				'error'   : function () {},
				'warn'    : function () {},
				'verbose' : function () {},
				'debug'   : function () {},
				'silly'   : function () {}
			};

			logger = new Logger( {
				'emitter' : new EventEmitter()
			} );
		} );

		it( '-- should return an object logger', function () {
			for ( var property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( config.logger[ property ] );
				}
			}
		} );

	} );

	describe( '- Default Logger -', function () {

		var logger;
		var config        = require( process.cwd() + '/lib/config' );
		var DefaultLogger = require( process.cwd() + '/lib/logger/defaultlogger' );
		var emitter       = new EventEmitter();

		before( function () {
			config.logger = null;
			logger        = new Logger( {
				'emitter' : emitter
			} );
		} );

		it( '-- should return a default logger', function () {
			var defaultLogger = new DefaultLogger( {
				'emitter' : emitter
			} );

			for ( var property in logger ) {
				if ( logger.hasOwnProperty( property ) ) {
					expect( logger[ property ] ).to.be.equal( defaultLogger[ property ] );
				}
			}
		} );

	} );
} );
