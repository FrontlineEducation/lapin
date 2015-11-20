'use strict';

module.exports = function ( options ) {

	var respond = options.respond;
	var log     = options.log;

	return {
		'success' : function ( data ) {

			respond( {
				'status' : 'success',
				'data'   : data
			} );

			setImmediate( function () {
				log.silly( 'success', {
					'data'        : data,
					'messageType' : options.messageType,
					'message'     : options.message
				} );
			} );
		},

		'error' : function ( data, errorData, code ) {

			respond( {
				'status'  : 'error',
				'message' : data, // interchanged because data is optional
				'data'    : errorData || {}, // optional
				'code'    : code || 0 // optional
			} );

			setImmediate( function () {
				log.error( data, {
					'data'        : errorData,
					'code'        : code,
					'messageType' : options.messageType,
					'msg'         : options.message
				} );
			} );

		},

		'fail' : function ( data ) {

			respond( {
				'status' : 'fail',
				'data'   : data
			} );

			setImmediate( function () {
				log.warn( 'fail', {
					'data'        : data,
					'messageType' : options.messageType,
					'message'     : options.message
				} );
			} );

		}
	};
};
