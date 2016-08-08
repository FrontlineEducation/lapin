'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;

describe( 'Perform Send Receive', function () {
	const rabbit = requireNew( 'rabbot' );
	const Lapin  = requireNew( process.cwd() );

	let lapin;

	before( function ( done ) {
		lapin  = new Lapin( rabbit );
		require( '../init' )( {
			done,
			rabbit
		} );
	} );

	describe( 'WITH payload', function () {
		let received, receivedData;

		const payload = { 'user' : 'Testfoo' };

		before( function ( done ) {
			lapin.receive( 'v1.sendreceivetest.get', function ( data, send ) {
				receivedData = data;
				send.success( data );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.send( 'v1.sendreceivetest.get', payload, function ( error, data ) {
						received = data;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should RECEIVED correct data', function () {
			expect( receivedData ).be.an( 'object' );
			expect( receivedData.user ).to.equal( 'Testfoo' );
		} );

		it( '-- should SEND success data', function () {
			expect( received ).be.an( 'object' );
			expect( received.status ).to.exist.and.to.equal( 'success' );
			expect( received.data ).to.exist.and.to.equal( 'Message sent' );
		} );
	} );

	describe( 'WITH payload and OPTIONS', function () {
		const payload = { 'user' : 'Testfoo' };

		let received, receivedData;

		before( function ( done ) {
			lapin.receive( {
				'messageType' : 'v1.sendrectest-opts.get',
				'limit'       : 1,
				'noBatch'     : true
			}, function ( data, send ) {
				receivedData = data;
				send.success( data );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.send( 'v1.sendrectest-opts.get', payload, function ( error, data ) {
						received = data;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should RECEIVED correct data', function () {
			expect( receivedData ).be.an( 'object' );
			expect( receivedData.user ).to.equal( 'Testfoo' );
		} );

		it( '-- should SEND success data', function () {
			expect( received ).be.an( 'object' );
			expect( received.status ).to.exist.and.to.equal( 'success' );
			expect( received.data ).to.exist.and.to.equal( 'Message sent' );
		} );
	} );

	describe( 'WITHOUT payload', function () {
		let received, failData;

		before( function ( done ) {
			let payload;

			lapin.send( 'v1.sendreceivetest.get', payload, function ( error, data ) {
				received  = data;
				failData = error;
				done();
			} );
		} );

		it( '-- should have a null response', function () {
			expect( received ).to.be.an( 'null' );
		} );

		it( '-- should received an failData in request', function () {
			expect( failData ).be.an( 'object' );
			expect( failData.status ).to.exist.and.to.equal( 'fail' );
			expect( failData.data ).to.exist.and.to.equal( 'Invalid data' );
		} );
	} );

	describe( '- Error Invalid Options-', function () {
		it( '-- should return error for NULL messageType ( Sender )', function ( done ) {
			lapin.receive( 'v1.pubsub.null-options', function () {
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.send( null, { 'user' : 'Foo' }, function ( error, data ) {
						expect( error ).be.an( 'object' );
						expect( error.status ).to.equal( 'error' );
						expect( error.data ).to.exists;
						expect( data ).to.be.an( 'null' );
						done();
					} );
				} );
		} );

		it( '-- should return error for incorrect messageType ( Sender )', function ( done ) {
			lapin.receive( 'v1.pubsub.invalid-options', function () {
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.send( 'v1.invalid-options', { 'user' : 'Foo' }, function ( error, data ) {
						expect( error ).be.an( 'object' );
						expect( error.data ).to.exists;
						expect( error.status ).to.equal( 'error' );
						expect( data ).to.be.an( 'null' );
						done();
					} );
				} );
		} );

		it( '-- should return error for NULL messageType ( Receiver )', function ( done ) {
			try {
				lapin.receive( null, function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should return error for incorrect messageType ( Receiver )', function ( done ) {
			try {
				lapin.receive( 'v1.', function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for not supported messageType ( Receiver )', function ( done ) {
			try {
				lapin.receive( [ 'v1.test.throw', 'v1.test.error' ], function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for NULL messageType ( Receiver )', function ( done ) {
			try {
				lapin.receive( {
					'validate' : {}
				}, function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );
	} );
} );
