'use strict';

const _             = require( 'lodash' );
const config        = require( '../config' );
const defaultlogger = require( './defaultlogger' );
const dummylogger   = require( './dummylogger' );

module.exports = function ( options ) {
	if ( !options || !options.emitter ) {
		// returns dummy logger
		return dummylogger();
	}

	const defaultLogger = defaultlogger( options );
	const logger        = config.logger;

	if ( _.isFunction( logger ) ) {
		// override all logger functions
		for ( const property in defaultLogger ) {
			if ( defaultLogger.hasOwnProperty( property ) ) {
				defaultLogger[ property ] = logger;
			}
		}

		return defaultLogger;
	// if there is a logger object passed
	} else if ( _.isObject( logger ) ) {
		for ( const propertyObj in defaultLogger ) {
			if ( defaultLogger.hasOwnProperty( propertyObj ) && !_.has( logger, propertyObj ) ) {
				logger[ propertyObj ] = defaultLogger[ propertyObj ];
			}
		}

		return logger;
	}

	return defaultLogger;
};
