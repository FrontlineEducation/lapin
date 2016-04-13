'use strict';

/* eslint no-unused-expressions:0 */

const expect      = require( 'chai' ).expect;
const dummylogger = require( process.cwd() + '/lib/logger/dummylogger' );

describe( 'dummy logger', function () {
	const dummyLogger = dummylogger();

	it( 'should invoke error', function () {
		expect( typeof dummyLogger.error ).to.be.equal( 'function' );
		dummyLogger.error();
	} );

	it( 'should invoke warn', function () {
		expect( typeof dummyLogger.warn ).to.be.equal( 'function' );
		dummyLogger.warn();
	} );

	it( 'should invoke info', function () {
		expect( typeof dummyLogger.info ).to.be.equal( 'function' );
		dummyLogger.info();
	} );

	it( 'should invoke verbose', function () {
		expect( typeof dummyLogger.verbose ).to.be.equal( 'function' );
		dummyLogger.verbose();
	} );

	it( 'should invoke debug', function () {
		expect( typeof dummyLogger.debug ).to.be.equal( 'function' );
		dummyLogger.debug();
	} );

	it( 'should invoke silly', function () {
		expect( typeof dummyLogger.silly ).to.be.equal( 'function' );
		dummyLogger.silly();
	} );
} );
