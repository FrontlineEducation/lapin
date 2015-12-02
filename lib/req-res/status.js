'use strict';

var config = require( '../config' );
var mixins = require( '../util/mixins' );

module.exports = function ( options ) {

	var respond        = options.respond;
	var log            = options.log;
	var timeoutHandler = config.timeout;

	var responded = false;

	var timeout = timeoutHandler.set( {
		'respond'     : respond,
		'log'         : log,
		'emitter'     : options.emitter,
		'messageType' : options.messageType,
		'message'     : options.message
	}, function () {
		responded = true;
	} );

	function reply ( cb ) {
		if ( !responded ) {
			timeoutHandler.clear( timeout );
			cb();
		}
	}

	return {
		'success' : function ( data ) {

			reply( function () {
				respond( {
					'status' : 'success',
					'data'   : data
				} );
				setImmediate( function () {
					log.silly( 'success', {
						'data'        : mixins.cloneDeep( data ) || {},
						'messageType' : options.messageType,
						'message'     : mixins.cloneDeep( options.message ) || {}
					} );
				} );
			} );
		},

		'error' : function ( data, errorData, code ) {

			reply( function () {
				timeoutHandler.clear( timeout );
				respond( {
					'status'  : 'error',
					'message' : data, // interchanged because data is optional
					'data'    : errorData || {}, // optional
					'code'    : code || 0 // optional
				} );
				setImmediate( function () {
					log.error( data, {
						'data'        : mixins.cloneDeep( errorData ) || {},
						'code'        : code,
						'messageType' : options.messageType,
						'msg'         : mixins.cloneDeep( options.message ) || {}
					} );
				} );
			} );
		},

		'fail' : function ( data ) {

			reply( function () {
				timeoutHandler.clear( timeout );
				respond( {
					'status' : 'fail',
					'data'   : data
				} );
				setImmediate( function () {
					log.warn( 'fail', {
						'data'        : mixins.cloneDeep( data ) || {},
						'messageType' : options.messageType,
						'message'     : mixins.cloneDeep( options.message ) || {}
					} );
				} );
			} );
		}
	};
};
