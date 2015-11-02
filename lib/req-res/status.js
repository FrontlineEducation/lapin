'use strict';

module.exports = function ( options ) {

	var respond = options.respond;
	var log     = options.log;

	return {
		'success' : function ( data ) {

			log.info( 'success', data );

			respond( {
				'status' : 'success',
				'data'   : data
			} );
		},

		'error' : function ( data, errorData, code ) {

			log.error( data, {
				'data'        : errorData,
				'code'        : code,
				'messageType' : options.messageType,
				'msg'         : options.message
			} );

			respond( {
				'status'  : 'error',
				'message' : data, // interchanged because data is optional
				'data'    : errorData || {}, // optional
				'code'    : code || 0 // optional
			} );

		},

		'fail' : function ( data ) {

			log.warn( data );

			respond( {
				'status' : 'fail',
				'data'   : data
			} );
		}
	};
};
