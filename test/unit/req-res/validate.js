'use strict';

/* eslint no-unused-expressions:0 */

const Joi      = require( 'joi' );
const expect   = require( 'chai' ).expect;
const validate = require( process.cwd() + '/lib/req-res/validate' );

describe( 'Validation Joi wrapper', function () {
	const requestData = {
		'username'  : 'Testfoo',
		'firstname' : 'Test',
		'lastname'  : 'Foo'
	};

	const schema = {
		'username'  : Joi.string().required(),
		'firstname' : Joi.string(),
		'lastname'  : Joi.string().required(),
		'created'   : Joi.date().default( Date.now, 'time of creation' ),
		'status'    : Joi.string().default( 'registered' )
	};

	it( 'should return validated data', function ( done ) {
		validate( {
			schema,
			'value' : requestData
		} )
		.then( function ( data ) {
			expect( requestData.username ).to.equal( data.username );
			done();
		} );
	} );

	it( 'should return validation error', function ( done ) {
		validate( {
			schema,
			'value' : { 'username' : 'Testfoo' }
		} )
		.catch( function ( error ) {
			expect( error ).to.exist;
			done();
		} );
	} );

	it( 'should return error on validation', function ( done ) {
		validate( {
			schema,
			'value' : null
		} )
		.catch( function ( error ) {
			expect( error ).to.equal( 'Error on validation' );
			done();
		} );
	} );
} );
