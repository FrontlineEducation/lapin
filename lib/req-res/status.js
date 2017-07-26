'use strict';

const mixins = require( '../util/mixins' );

module.exports = function ( options ) {
	const respond        = options.respond;
	const log            = options.log;

	function reply ( cb ) {
		if ( options.timeout ) {
			// not called or cleared
			/* eslint no-underscore-dangle:0 */
			if ( options.timeout._idlePrev ) {
				clearTimeout( options.timeout );
				cb();
			}
		} else {
			cb();
		}
	}

	let statusObj = {
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

	/* istanbul ignore next */
	process.on( 'unhandledRejection', function ( error ) {
		statusObj.error( 'unhandledRejection', error, '3d8e367f-b466-4341-9d6d-1de99ddea69c' );
	} );

	/* istanbul ignore next */
	process.on( 'uncaughtException', function ( error ) {
		statusObj.error( 'uncaughtException', error, '0c8865b5-ec8e-4ce1-8e20-eda7e1d077f4' );
	} );

	return statusObj;
};
