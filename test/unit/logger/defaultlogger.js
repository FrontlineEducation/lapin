'use strict';

/* eslint no-unused-expressions:0 */

const EventEmitter = require( 'events' ).EventEmitter;
const expect       = require( 'chai' ).expect;
const requireNew   = require( 'require-new' );

describe( 'default logger', function () {
	const defaultlogger = requireNew( process.cwd() + '/lib/logger/defaultlogger' );
	const emitter       = new EventEmitter();
	const defaultLogger = defaultlogger( {
		emitter
	} );

	it( 'should invoke error', function ( done ) {
		emitter.on( 'error-log', function ( msg, data ) {
			expect( msg ).to.equal( 'error' );
			expect( data ).to.equal( 'data' );
			done();
		} );

		defaultLogger.error( 'error', 'data' );
	} );

	it( 'should invoke warn', function ( done ) {
		emitter.on( 'warn-log', function ( msg, data ) {
			expect( msg ).to.equal( 'warn' );
			expect( data ).to.equal( 'data' );
			done();
		} );

		defaultLogger.warn( 'warn', 'data' );
	} );

	it( 'should invoke info', function ( done ) {
		emitter.on( 'info-log', function ( msg, data ) {
			expect( msg ).to.equal( 'info' );
			expect( data ).to.equal( 'data' );
			done();
		} );

		defaultLogger.info( 'info', 'data' );
	} );

	it( 'should invoke verbose', function ( done ) {
		emitter.on( 'verbose-log', function ( msg, data ) {
			expect( msg ).to.equal( 'verbose' );
			expect( data ).to.equal( 'data' );
			done();
		} );

		defaultLogger.verbose( 'verbose', 'data' );
	} );

	it( 'should invoke debug', function ( done ) {
		emitter.on( 'debug-log', function ( msg, data ) {
			expect( msg ).to.equal( 'debug' );
			expect( data ).to.equal( 'data' );
			done();
		} );

		defaultLogger.debug( 'debug', 'data' );
	} );

	it( 'should invoke silly', function ( done ) {
		emitter.on( 'silly-log', function ( msg, data ) {
			expect( msg ).to.equal( 'silly' );
			expect( data ).to.equal( 'data' );
			done();
		} );

		defaultLogger.silly( 'silly', 'data' );
	} );
} );
