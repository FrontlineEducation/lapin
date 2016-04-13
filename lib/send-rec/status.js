'use strict';

const mixins = require( '../util/mixins' );

module.exports = function ( options ) {
	const consume = options.consume;
	const log     = options.log;

	return {
		success ( data ) {
			consume( {
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
		},

		error ( data, errorData, code ) {
			consume( {
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
		},

		fail ( data ) {
			consume( {
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
		}
	};
};
