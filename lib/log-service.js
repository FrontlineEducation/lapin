'use strict';

var SendRec = require( './send-receive' );

function Logger ( options ) {

	this.sendRec = new SendRec( options.rabbit );
	this.prefix  = options.logService.prefix;
}

/*
	log.prefix
	log.data
	log.logMessage
	log.info
 */
Logger.prototype.info = function ( log ) {

	log.level  = 'info';

	this.sendRec.send( this.prefix, log, function ( errorInfo ) {
		if ( errorInfo ) {
			console.log( 'log-info error' );
		}
	} );
};

Logger.prototype.warn = function ( log ) {

	log.level  = 'warn';

	this.sendRec.send( this.prefix, log, function ( errorWarning ) {
		if ( errorWarning ) {
			console.log( 'log-warning error' );
		}
	} );
};

Logger.prototype.error = function ( log ) {

	log.level  = 'error';

	this.sendRec.send( this.prefix, log, function ( errorError ) {
		if ( errorError ) {
			console.log( 'log-error error' );
		}
	} );
};

module.exports = Logger;
