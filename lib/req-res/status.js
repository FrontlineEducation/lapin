'use strict';

const config = require( '../config' );
const mixins = require( '../util/mixins' );

module.exports = function ( options ) {
	const respond        = options.respond;
	const log            = options.log;
	const timeoutHandler = config.timeout;

	let onceReply = true;
	let responded = false;

	const timeout = timeoutHandler.set( {
		respond,
		log,
		'emitter'     : options.emitter,
		'messageType' : options.messageType,
		'message'     : options.message
	}, function () {
		responded = true;
	} );

	function reply ( cb ) {
		if ( !responded && onceReply ) {
			onceReply = false;
			timeoutHandler.clear( timeout );
			cb();
		}
	}

	return {
		success ( data ) {
			reply( function () {
				respond( {
					data,
					'status' : 'success'
				} );
				setImmediate( function () {
					log.silly( 'success', {
						'data'        : mixins.cloneDeep( data ) || {},
						'messageType' : options.messageType,
						'msg'         : mixins.cloneDeep( options.message ) || {}
					} );
				} );
			} );
		},

		error ( data, errorData, code ) {
			reply( function () {
				timeoutHandler.clear( timeout );
				respond( {
					'status' : 'error',

					// interchanged because data is optional
					'message' : data,

					// optional
					'data' : errorData || {},

					// optional
					'code' : code || 0
				} );

				setImmediate( function () {
					log.error( 'error', {
						code,
						'data'        : mixins.cloneDeep( errorData ) || {},
						'messageType' : options.messageType,
						'msg'         : mixins.cloneDeep( options.message ) || {},
						'errorMsg'    : data
					} );
				} );
			} );
		},

		fail ( data ) {
			reply( function () {
				timeoutHandler.clear( timeout );
				respond( {
					data,
					'status' : 'fail'
				} );
				setImmediate( function () {
					log.warn( 'fail', {
						'data'        : mixins.cloneDeep( data ) || {},
						'messageType' : options.messageType,
						'msg'         : mixins.cloneDeep( options.message ) || {}
					} );
				} );
			} );
		}
	};
};
