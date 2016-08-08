'use strict';

/* eslint no-unused-expressions:0 */

const requireNew = require( 'require-new' );
const expect     = require( 'chai' ).expect;
const Joi        = require( 'joi' );

describe( 'Perform request respond', function () {
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

	describe( '- Success -', function () {
		let response, errorResponse, request;

		before( function ( done ) {
			lapin.respond( 'v1.reqrestest.get', function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.get', { 'user' : 'Testfoo' }, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Testfoo' );
		} );

		it( '-- should return SUCCESS data', function () {
			expect( response ).be.an( 'object' );
			expect( response.status ).to.exist.and.to.equal( 'success' );
			expect( response.data ).to.exist.and.to.equal( 'users' );
		} );

		it( '-- should have a null error response', function () {
			expect( errorResponse ).to.be.an( 'null' );
		} );
	} );

	describe( '- Success with options -', function () {
		let response, errorResponse, request;

		before( function ( done ) {
			lapin.respond( {
				'messageType' : 'v1.reqrestest-opts.get',
				'limit'       : 1,
				'exchange'    : 'opts'
			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( {
						'messageType' : 'v1.reqrestest-opts.get',
						'exchange'    : 'opts'
					}, { 'user' : 'Testfoo' }, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Testfoo' );
		} );

		it( '-- should return SUCCESS data', function () {
			expect( response ).be.an( 'object' );
			expect( response.status ).to.exist.and.to.equal( 'success' );
			expect( response.data ).to.exist.and.to.equal( 'users' );
		} );

		it( '-- should have a null error response', function () {
			expect( errorResponse ).to.be.an( 'null' );
		} );
	} );

	describe( '- Success with JOI Validation -', function () {
		let response, errorResponse, request;

		const validationData = {
			'username'  : 'Testfoo',
			'password'  : 'foo',
			'birthyear' : 1990
		};

		before( function ( done ) {
			lapin.respond( {
				'messageType' : 'v1.reqrestest-joi.get',
				'validate'    : Joi.object().keys( {
					'username'     : Joi.string().alphanum().min( 3 ).max( 30 ).required(),
					'password'     : Joi.string().regex( /[a-zA-Z0-9]{3,30}/ ),
					'access_token' : [ Joi.string(), Joi.number() ],
					'birthyear'    : Joi.number().integer().min( 1900 ).max( 2013 ),
					'email'        : Joi.string().email()
				} ).with( 'username', 'birthyear' ).without( 'password', 'access_token' )
			}, function ( requestData, send ) {
				request = requestData;
				send.success( 'users' );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest-joi.get', validationData, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.username ).to.exist.and.to.equal( validationData.username );
			expect( request.password ).to.exist.and.to.equal( validationData.password );
			expect( request.birthyear ).to.exist.and.to.equal( validationData.birthyear );
		} );

		it( '-- should return SUCCESS data', function () {
			expect( response ).be.an( 'object' );
			expect( response.status ).to.exist.and.to.equal( 'success' );
			expect( response.data ).to.exist.and.to.equal( 'users' );
		} );

		it( '-- should have a null error response', function () {
			expect( errorResponse ).to.be.an( 'null' );
		} );
	} );

	describe( '- Error with JOI Validation -', function () {
		let response, failResponse, request;

		const validationData = {
			'username' : 'Testfoo',
			'password' : 'foo'
		};

		before( function ( done ) {
			lapin.respond( {
				'messageType' : 'v1.reqrestest-joi-fail.get',
				'validate'    : Joi.object().keys( {
					'username'     : Joi.string().alphanum().min( 3 ).max( 30 ).required(),
					'password'     : Joi.string().regex( /[a-zA-Z0-9]{3,30}/ ),
					'access_token' : [ Joi.string(), Joi.number() ],
					'birthyear'    : Joi.number().integer().min( 1900 ).max( 2013 ),
					'email'        : Joi.string().email()
				} ).with( 'username', 'birthyear' ).without( 'password', 'access_token' )
			}, function ( requestData, send ) {
				// will not call callback
				request = requestData;
				send.success( 'users' );
			} )

				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest-joi-fail.get', validationData, function ( error, data ) {
						response     = data;
						failResponse = error;
						setTimeout(  done, 1000 );
					} );
				} );
		} );

		it( '-- should receive requestData and bypass callback', function () {
			expect( request ).be.not.exist;
		} );

		it( '-- should return FAIL data', function () {
			expect( failResponse ).be.an( 'object' );
			expect( failResponse.status ).to.exist.and.to.equal( 'fail' );
			expect( failResponse.data ).to.exist;
		} );

		it( '-- should have a null response', function () {
			expect( response ).to.be.an( 'null' );
		} );
	} );

	describe( '- Error -', function () {
		let response, errorResponse, request;

		before( function ( done ) {
			lapin.respond( 'v1.reqrestest.post', function ( requestData, send ) {
				request   = requestData;
				const error = new Error( 'Something went wrong' );

				send.error( error.message, error, 500 );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.post', { 'user' : 'Foo' }, function ( error, data ) {
						response      = data;
						errorResponse = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Foo' );
		} );

		it( '-- should return ERROR data', function (  ) {
			expect( errorResponse ).be.an( 'object' );
			expect( errorResponse.status ).to.exist.and.to.equal( 'error' );
			expect( errorResponse.message ).to.exist.and.to.equal( 'Something went wrong' );
			expect( errorResponse.code ).to.exist.and.to.equal( 500 );
			expect( errorResponse.data ).to.exist;
		} );

		it( '-- should have a null response', function () {
			expect( response ).to.be.an( 'null' );
		} );
	} );

	describe( '- Error Invalid Options-', function () {
		it( '-- should return error for NULL messageType ( Requester )', function ( done ) {
			lapin.respond( 'v1.reqrestest.null-options', function () {
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( null, { 'user' : 'Foo' }, function ( error, data ) {
						expect( error ).be.an( 'object' );
						expect( error.status ).to.equal( 'error' );
						expect( error.data ).to.exists;
						expect( data ).to.be.an( 'null' );
						done();
					} );
				} );
		} );

		it( '-- should return error for incorrect messageType ( Requester )', function ( done ) {
			lapin.respond( 'v1.reqrestest.invalid-options', function () {
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.invalid-options', null, function ( error, data ) {
						expect( error ).be.an( 'object' );
						expect( error.data ).to.exists;
						expect( error.status ).to.equal( 'error' );
						expect( data ).to.be.an( 'null' );
						done();
					} );
				} );
		} );

		it( '-- should return error for NULL messageType ( Responder )', function ( done ) {
			try {
				lapin.respond( null, function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should return error for incorrect messageType ( Responder )', function ( done ) {
			try {
				lapin.respond( 'v1.', function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for not supported messageType ( Responder )', function ( done ) {
			try {
				lapin.respond( [ 'v1.test.throw', 'v1.test.error' ], function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );

		it( '-- should throw error for NULL messageType ( Responder )', function ( done ) {
			try {
				lapin.respond( {
					'validate' : {}
				}, function () {} );
			} catch ( error ) {
				expect( error ).to.be.instanceOf.Error;
				done();
			}
		} );
	} );

	describe( '- Fail -', function () {
		let response, failResponse, request;

		before( function ( done ) {
			lapin.respond( 'v1.reqrestest.put', function ( requestData, send ) {
				request = requestData;
				send.fail( 'Invalid data' );
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.put', { 'user' : 'Foo' }, function ( error, data ) {
						response     = data;
						failResponse = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should receive correct requestData', function () {
			expect( request ).be.an( 'object' );
			expect( request.user ).to.exist.and.to.equal( 'Foo' );
		} );

		it( '-- should return FAIL data', function () {
			expect( failResponse ).be.an( 'object' );
			expect( failResponse.status ).to.exist.and.to.equal( 'fail' );
			expect( failResponse.data ).to.exist.and.to.equal( 'Invalid data' );
		} );

		it( '-- should have a null response', function () {
			expect( response ).to.be.an( 'null' );
		} );
	} );

	// error for now in the future this should be FAIL
	describe( '- Fail WITHOUT payload -', function () {
		let failData, response;

		before( function ( done ) {
			let payload;

			lapin.request( 'v1.reqrestest.put', payload, function ( error, data ) {
				response = data;
				failData = error;
				done();
			} );
		} );

		it( '-- should have a null response', function () {
			expect( response ).to.be.an( 'null' );
		} );

		it( '-- should received an failData in request', function () {
			expect( failData ).be.an( 'object' );
			expect( failData.status ).to.exist.and.to.equal( 'fail' );
			expect( failData.data ).to.exist.and.to.equal( 'Invalid data' );
		} );
	} );

	describe( '- Error with the responder code -', function () {
		let errorData, response;

		before( function ( done ) {
			lapin.respond( 'v1.reqrestest.errorcode', function () {
				/* eslint no-undef:0 */
				sdf;
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.errorcode', { 'user' : 'Foo' }, function ( error, data ) {
						response  = data;
						errorData = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should have a null response', function () {
			expect( response ).to.be.an( 'null' );
		} );

		it( '-- should received an errorData in request', function () {
			expect( errorData ).be.an( 'object' );
			expect( errorData.status ).to.exist.and.to.equal( 'error' );
			expect( errorData.data ).to.exist;
			expect( errorData.message ).to.exist;
		} );
	} );

	describe( '- Error with the responder code -', function () {
		let errorData, response;

		before( function ( done ) {
			lapin.respond( 'v1.reqrestest.errorcode-hello', function () {
				/* eslint no-undef:0 */
				throw 'hello';
			} )
				.on( 'error', done )
				.on( 'ready', function () {
					lapin.request( 'v1.reqrestest.errorcode-hello', { 'user' : 'Foo' }, function ( error, data ) {
						response  = data;
						errorData = error;
						setTimeout( done, 1000 );
					} );
				} );
		} );

		it( '-- should have a null response', function () {
			expect( response ).to.be.an( 'null' );
		} );

		it( '-- should received an errorData in request', function () {
			expect( errorData ).be.an( 'object' );
			expect( errorData.status ).to.exist.and.to.equal( 'error' );
			expect( errorData.data ).to.exist;
		} );
	} );
} );
