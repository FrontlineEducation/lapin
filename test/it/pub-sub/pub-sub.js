'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var requireNew = require( 'require-new' );
var expect     = require( 'chai' ).expect;

describe( 'Perform publish subscribe', function () {

	var lapin;
	var rabbit = requireNew( 'wascally' );
	var Lapin  = requireNew( process.cwd() );

	before( function ( done ) {
		lapin = new Lapin( rabbit );
		require( '../init' )( {
			'done'   : done,
			'rabbit' : rabbit
		} );
	} );

	describe( 'WITH payload', function () {
		var published;
		var payload   = { 'user' : 'Testfoo' };
		var errorData = null;
		before( function ( done ) {

			lapin.subscribe( 'v1.pubtest.get', function ( data ) {
				published = data;
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.publish( 'v1.pubtest.get', payload, function ( error ) {
						errorData = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should SUBSCRIBED correct data', function () {

			expect( published ).be.an( 'object' );
			expect( published.user ).to.equal( 'Testfoo' );
			expect( errorData ).to.not.exist;

		} );
	} );

	describe( 'WITH payload and options', function () {
		var published;
		var payload   = { 'user' : 'Testfoo' };
		var errorData = null;

		before( function ( done ) {

			lapin.subscribe( {
				'messageType' : 'v1.pubtest-opts.get',
				'limit'       : 1
			}, function ( data ) {
				published = data;
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.publish( 'v1.pubtest-opts.get', payload, function ( error ) {
						errorData = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should SUBSCRIBED correct data', function () {

			expect( published ).be.an( 'object' );
			expect( published.user ).to.equal( 'Testfoo' );
			expect( errorData ).to.not.exist;

		} );
	} );

	describe( 'WITHOUT payload', function () {

		var failData;

		before( function ( done ) {
			var payload;
			lapin.publish( 'v1.pubtest.get', payload, function ( error ) {
				failData = error;
				done();
			} );
		} );

		it( '-- should subscribed failData in publish', function () {

			expect( failData ).be.an( 'object' );
			expect( failData.status ).to.exist.and.to.equal( 'fail' );
			expect( failData.data ).to.exist.and.to.equal( 'Invalid data' );

		} );

	} );

	describe( '- Error Invalid Options-', function () {

		it( '-- should return error for NULL messageType ( Publisher )', function ( done ) {
			lapin.subscribe( 'v1.pubsub.null-options', function () {
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.publish( null, { 'user' : 'Foo' }, function ( error, data ) {
						expect( error ).be.an( 'object' );
						expect( error.status ).to.equal( 'error' );
						expect( error.data ).to.exists;
						expect( data ).to.be.an( 'null' );
						done();
					} );
				} );
		} );

		it( '-- should return error for incorrect messageType ( Publisher )', function ( done ) {
			lapin.subscribe( 'v1.pubsub.invalid-options', function () {
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.publish( 'v1.invalid-options', { 'user' : 'Foo' }, function ( error, data ) {
						expect( error ).be.an( 'object' );
						expect( error.data ).to.exists;
						expect( error.status ).to.equal( 'error' );
						expect( data ).to.be.an( 'null' );
						done();
					} );
				} );
		} );

		it( '-- should throw error for NULL messageType ( Subscriber )', function ( done ) {
			try {
				lapin.subscribe( null, function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for incorrect messageType ( Subscriber )', function ( done ) {
			try {
				lapin.subscribe( 'v1.', function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for not supported messageType ( Subscriber )', function ( done ) {
			try {
				lapin.subscribe( [ 'v1.test.throw', 'v1.test.error' ], function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for not supported messageType ( Subscriber )', function ( done ) {
			try {
				lapin.subscribe( [ 'v1.test.throw', 'v1.test.error' ], function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for NULL messageType ( Subscriber )', function ( done ) {
			try {
				lapin.subscribe( {
					'validate' : {}
				}, function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );
	} );
} );
