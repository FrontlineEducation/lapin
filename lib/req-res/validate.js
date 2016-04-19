'use strict';

const Joi     = require( 'joi' );
const Promise = require( 'bluebird' );
const Err     = require( '../util/error' );

/*
Validation wrapper of Joi
	@params options
		- value   : message or data
		- schema  : Joi object schema
		- options : validation options

see more options here : https://github.com/hapijs/joi
 */

module.exports = function ( options ) {
	return new Promise( function ( resolve, reject ) {
		if ( !options || !options.value ) {
			return reject( new Error( 'Invalid options defined in validation' ) );
		}

		if ( !options.schema ) {
			return reject( new Err.UnknownSchemaError( 'Schema not defined' ) );
		}

		const joiOptions = options.options || {};

		Joi.validate( options.value, options.schema, joiOptions, function ( error, value ) {
			if ( error ) {
				return reject( new Err.ValidationError( error ) );
			}
			resolve( value );
		} );
	} );
};
