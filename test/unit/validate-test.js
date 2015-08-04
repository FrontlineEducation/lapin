'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var Joi      = require( 'joi' );
var expect   = require( 'chai' ).expect;
var validate = require( process.cwd() + '/lib/validate' );

describe( 'Validation Joi wrapper', function () {

	var requestData = {
		'username'  : 'Testfoo',
		'firstname' : 'Test',
		'lastname'  : 'Foo'
	};

	var schema = {
		'username'  : Joi.string().required(),
		'firstname' : Joi.string(),
		'lastname'  : Joi.string().required(),
		'created'   : Joi.date().default( Date.now, 'time of creation' ),
		'status'    : Joi.string().default( 'registered' )
	};

	it( 'should return validated data', function ( done ) {

		validate( {
			'value'  : requestData,
			'schema' : schema
		} )
		.then( function ( data ) {
			expect( requestData.username ).to.equal( data.username );
			done();
		} );

	} );

	it( 'should return validation error', function ( done ) {

		validate( {
			'value'  : { 'username' : 'Testfoo' },
			'schema' : schema
		} )
		.catch( function ( error ) {
			expect( error ).to.exist;
			done();
		} );

	} );

	it( 'should return error on validation', function ( done ) {

		validate( {
			'value'  : null,
			'schema' : schema
		} )
		.catch( function ( error ) {
			expect( error ).to.equal( 'Error on validation' );
			done();
		} );

	} );
} );
