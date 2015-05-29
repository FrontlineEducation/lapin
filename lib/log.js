/*
	Log obj
 */

'use strict';

var LogService = require( './log-service' );

function Logger () {}

Logger.prototype.info  = function () {};
Logger.prototype.warn  = function () {};
Logger.prototype.error = function () {};

module.exports = function ( options ) {

	/*
		precedence
		- logging through a service
		- logging using a logger object
		- empty logger obj
	 */

	if ( options.logService ) {
		return new LogService( options );
	}
	if ( options.logObject ) {
		return options.logObject;
	}

	return new Logger();
};
