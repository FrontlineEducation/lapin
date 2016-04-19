'use strict';

const util = require( 'util' );

function createError ( name ) {
	function error ( err ) {
		if ( err instanceof Error ) {
			this.message = err.message;
			this.stack   = err.stack;
		} else {
			this.message = err;
			Error.captureStackTrace( this, this.constructor );
		}

		this.name = name;
	}

	error.displayName = error.prototype.name = name;
	util.inherits( error, Error );

	return error;
}

module.exports = {
	'ValidationError'    : createError( 'ValidationError' ),
	'UnknownSchemaError' : createError( 'UnknownSchemaError' )
};
