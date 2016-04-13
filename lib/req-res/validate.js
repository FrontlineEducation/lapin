'use strict';

const Joi     = require( 'joi' );
const Promise = require( 'bluebird' );

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
		if ( !options || !options.value || !options.schema ) {
			return reject( 'Error on validation' );
		}

		const joiOptions = options.options || {};

		Joi.validate( options.value, options.schema, joiOptions, function ( error, value ) {
			if ( error ) {
				return reject( error );
			}
			resolve( value );
		} );
	} );
};
