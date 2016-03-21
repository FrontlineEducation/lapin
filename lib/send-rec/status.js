'use strict';

var mixins = require( '../util/mixins' );

module.exports = function ( options ) {

	var consume = options.consume;
	var log     = options.log;
	return {
		'success' : function ( data ) {
			consume( {
				'status' : 'success',
				'data'   : data
			} );

			setImmediate( function () {
				log.silly( 'success', {
					'data'        : mixins.cloneDeep( data ) || {},
					'messageType' : options.messageType,
					'msg'         : mixins.cloneDeep( options.message ) || {}
				} );
			} );
		},

		'error' : function ( data, errorData, code ) {
			consume( {
				'status'  : 'error',
				'message' : data, // interchanged because data is optional
				'data'    : errorData || {}, // optional
				'code'    : code || 0 // optional
			} );
			setImmediate( function () {
				log.error( 'error', {
					'data'        : mixins.cloneDeep( errorData ) || {},
					'code'        : code,
					'messageType' : options.messageType,
					'msg'         : mixins.cloneDeep( options.message ) || {},
					'errorMsg'    : data
				} );
			} );
		},

		'fail' : function ( data ) {
			consume( {
				'status' : 'fail',
				'data'   : data
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
