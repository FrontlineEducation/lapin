'use strict';

const mixins  = require( './mixins' );

/* eslint consistent-return:0 */
function TimeoutHandler () {
	this.disable = true;
}

TimeoutHandler.prototype.setOptions = function ( options ) {
	if ( options ) {
		this.disable = false;
		const defaultConfig = {
			'ms' : 40000
		};

		this.options = options || defaultConfig;
	}
};

TimeoutHandler.prototype.set = function ( options, cb ) {
	if ( this.disable ) {
		return;
	}

	const respond = options.respond;
	const log     = options.log;
	const emitter = options.emitter;

	return setTimeout( function () {
		respond( {
			'status' : 'error',
			'data'   : 'Request timeout'
		} );

		const msg = mixins.cloneDeep( options.message ) || {};

		emitter.emit( 'timeout', {
			'messageType' : options.messageType,
			'message'     : msg
		} );
		setImmediate( function () {
			log.error( 'timeout', {
				msg,
				'messageType' : options.messageType
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
