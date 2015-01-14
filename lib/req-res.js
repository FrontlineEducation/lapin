'use strict';

// Load core modules
var util = require( 'util' );
var mixins = require( './mixins' );

// Load third-party modules
var Rabbus = require( 'rabbus' );

module.exports = function ReqRes ( Rabbit ) {
	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	function request ( messageType, message, callback ) {

		function Requester ( rabbus ) {

			mixins.extract( messageType, function ( error, meta ) {

				if ( error ) {
					// Return error
					throw error;
				}
				// Create requester if valid messageType
				Rabbus.Requester.call( this, rabbus, {
					'exchange'    : 'req-res.' + meta.resource + '-exchange',
					'messageType' : 'req-res.' + messageType
				} );

			}.bind( this ) );

		}

		util.inherits( Requester, Rabbus.Requester );

		if ( !cache.producers[ messageType ] ) {
			cache.producers[ messageType ] = new Requester( Rabbit );
		}

		cache.producers[ messageType ].request( message, function ( data ) {
			var error = null;

			if ( data.status !== 'success' ) {
				error = data;
				data  = null;
			}

			callback( error, data );

		} );
	}

	function response ( messageType, callback ) {

		function Responder ( rabbus ) {

			mixins.extract( messageType, function ( error, meta ) {

				if ( error ) {
					// Return error
					throw error;
				}
				// Create responder if valid messageType
				Rabbus.Responder.call( this, rabbus, {
					'exchange'    : 'req-res.' + meta.resource + '-exchange',
					'queue'       : 'req-res.' + meta.resource + '-queue',
					'messageType' : 'req-res.' + messageType
				} );

			}.bind( this ) );

		}

		util.inherits( Responder, Rabbus.Responder );

		if ( !cache.consumers[ messageType ] ) {
			cache.consumers[ messageType ] = new Responder( Rabbit );
		}

		cache.consumers[ messageType ].handle( callback );
	}

	return {
		'request'  : request,
		'response' : response
	};
};
