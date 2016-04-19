'use strict';

const expect = require( 'chai' ).expect;
const Err    = require( process.cwd() + '/lib/util/error' );

describe( 'Custom Error', function () {
	it( 'should return ValidationError', () => {
		const valError = new Err.ValidationError( 'error' );

		expect( valError ).to.be.instanceof( Err.ValidationError );
		expect( valError.name ).to.be.equal( 'ValidationError' );
		expect( valError.message ).to.be.equal( 'error' );
	} );

	it( 'should return UnknownSchemaError', () => {
		const valError = new Err.UnknownSchemaError( 'error' );

		expect( valError ).to.be.instanceof( Err.UnknownSchemaError );
		expect( valError.name ).to.be.equal( 'UnknownSchemaError' );
		expect( valError.message ).to.be.equal( 'error' );
	} );
} );
