'use strict';

var _             = require( 'lodash' );
var config        = require( '../config' );
var defaultlogger = require( './defaultlogger' );
var dummylogger   = require( './dummylogger' );

module.exports = function ( options ) {

	if ( !options || !options.emitter ) {
		// returns dummy logger
		return dummylogger();
	}

	var defaultLogger = defaultlogger( options );
	var logger        = config.logger;
	if ( _.isFunction( logger ) ) {
		// override all logger functions
		for ( var property in defaultLogger ) {
			if ( defaultLogger.hasOwnProperty( property ) ) {
				defaultLogger[ property ] = logger;
			}
		}

		return defaultLogger;

	} else if ( _.isObject( logger ) ) { // if there is a logger object passed

		for ( var propertyObj in defaultLogger ) {
			if ( defaultLogger.hasOwnProperty( propertyObj ) && !( _.has( logger, propertyObj ) ) ) {
				logger[ propertyObj ] = defaultLogger[ propertyObj ];
			}
		}
		return logger;

	}

	return defaultLogger;
};
