'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform publish subscribe', function () {
	const rabbit = requireNew( 'rabbot' );
	const Lapin  = requireNew( process.cwd() );

	let lapin;

	before( function ( done ) {
		lapin = new Lapin( rabbit );
		require( '../init' )( {
			done,
			rabbit
		} );
	} );

	describe( 'WITH payload', function () {
		const payload   = { 'user' : 'Testfoo' };

		let published;
		let errorData = null;

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
		const payload   = { 'user' : 'Testfoo' };

		let published;
		let errorData = null;

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
		let failData;

		before( function ( done ) {
			let payload;

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
