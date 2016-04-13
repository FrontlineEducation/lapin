'use strict';

// Common replies

const mixins = require( './mixins' );

module.exports = {
	invalidData ( callback, producer, message ) {
		setImmediate( function () {
			producer.logger.warn( 'fail', {
				'data'        : 'Invalid data',
				'msg'         : mixins.cloneDeep( message ) || {},
				'messageType' : producer.messageType
			} );
		} );

		callback( {
			'status' : 'fail',
			'data'   : 'Invalid data'
		}, null );
	},

	errorOptions ( callback, emitter, message ) {
		setImmediate( function () {
			emitter.logger.error( 'error', {
				'data'        : emitter.error,
				'msg'         : mixins.cloneDeep( message ) || {},
				'messageType' : emitter.messageType
			} );
		} );

		callback( {
			'status'  : 'error',
			'data'    : emitter.error,
			'message' : emitter.error.message
		}, null );
	}
};
