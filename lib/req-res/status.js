'use strict';

module.exports = function ( options ) {

	var respond = options.respond;
	var log     = options.log;
	var emitter = options.emitter;

	var responded = false;

	var timeout = setTimeout( function () {
		responded = true;
		respond( {
			'status' : 'fail',
			'data'   : 'Request timeout'
		} );
		setImmediate( function () {
			log.silly( 'success', {
				'messageType' : options.messageType,
				'message'     : options.message
			} );
		} );
		emitter.emit( 'timeout', {
			'messageType' : options.messageType,
			'message'     : options.message
		} );
	}, 40000 );

	return {
		'success' : function ( data ) {

			if ( !responded ) {
				clearTimeout( timeout );
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
			}
		},

		'error' : function ( data, errorData, code ) {

			if ( !responded ) {
				clearTimeout( timeout );
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
			}
		},

		'fail' : function ( data ) {

			if ( !responded ) {
				clearTimeout( timeout );
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
		}
	};
};
