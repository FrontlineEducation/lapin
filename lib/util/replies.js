'use strict';

// Common replies

var mixins = require( './mixins' );

module.exports = {
	'invalidData' : function ( callback, producer, message ) {

		setImmediate( function () {
			producer.logger.warn( 'fail', {
				'data'        : 'Invalid data',
				'message'     : mixins.cloneDeep( message ) || {},
				'messageType' : producer.messageType
			} );
		} );

		callback( {
			'status' : 'fail',
			'data'   : 'Invalid data'
		}, null );
	},

	'errorOptions' : function ( callback, emitter, message ) {

		setImmediate( function () {
			emitter.logger.error( 'error', {
				'data'        : emitter.error,
				'message'     : mixins.cloneDeep( message ) || {},
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
