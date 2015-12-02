'use strict';

var mixins  = require( './mixins' );

/* eslint consistent-return:0 */
function TimeoutHandler () {
	this.disable = true;
}

TimeoutHandler.prototype.setOptions = function ( options ) {
	if ( options ) {
		this.disable = false;
		var defaultConfig = {
			'ms' : 40000
		};
		this.options = options || defaultConfig;
	}
};

TimeoutHandler.prototype.set = function ( options, cb ) {

	if ( this.disable ) {
		return;
	}

	var respond = options.respond;
	var log     = options.log;
	var emitter = options.emitter;

	return setTimeout( function () {
		respond( {
			'status' : 'error',
			'data'   : 'Request timeout'
		} );

		var msg = mixins.cloneDeep( options.message ) || {};
		emitter.emit( 'timeout', {
			'messageType' : options.messageType,
			'message'     : msg
		} );
		setImmediate( function () {
			log.error( 'timeout', {
				'messageType' : options.messageType,
				'message'     : msg
			} );
		} );
		cb();
	}, this.options.ms );

};

TimeoutHandler.prototype.clear = function ( timeoutId ) {

	if ( this.disable ) {
		return;
	}

	clearTimeout( timeoutId );
};

module.exports = TimeoutHandler;
