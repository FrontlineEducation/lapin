'use strict';

/* eslint no-underscore-dangle:0 */
/* eslint no-unused-expressions:0 */

const expect  = require( 'chai' ).expect;
const Emitter = require( 'events' ).EventEmitter;

describe( 'Timeout', function () {
	const Timeout = require( process.cwd() + '/lib/util/timeout' );
	const timeout = new Timeout();
	let options   = {
		respond () {},
		'log' : {
			error () {}
		},

		'emitter'     : new Emitter(),
		'messageType' : 'v1.test.hello'
	};

	it( 'should set options with default ms', function () {
		timeout.setOptions( options );
		expect( timeout.options.ms ).to.equal( 40000 );
	} );

	it( 'should set timer and return a timer object', function ( done ) {
		options.ms = 1000;
		const timer = timeout.set( options, function () {
			expect( timer ).not.null;
			expect( timer._called ).to.equal( true );
			done();
		} );
	} );

	it( 'should set timer and return a timer object', function () {
		const timer = timeout.set( options  );

		expect( timer ).not.null;
		expect( timer._called ).to.equal( false );
	} );
} );
