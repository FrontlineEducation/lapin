'use strict';

// Load core modules
var util = require( 'util' );

// Load third-party modules
var Rabbus = require( 'rabbus' );

module.exports = function ( Rabbit ) {
	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	function request ( messageType, mesage, callback ) {
		function Requester ( rabbus ) {
			Rabbus.Requester.call( this, rabbus, {
				'exchange'    : 'req-res.exchange',
				'messageType' : 'req-res.' + messageType
			} );
		}
		util.inherits( Requester, Rabbus.Requester );

		if ( !cache.producers[ messageType ] ) {
			cache.producers[ messageType ] = new Requester( Rabbit );
		}

		cache.producers[ messageType ].request( mesage, function ( data, done ) {
			var error = null;

			if ( data.status !== 'success' ) {
				error = data;
				data  = null;
			}

			callback.call( null, error, data );
		} );
	}

	function response ( messageType, callback ) {
		function Responder ( rabbus ) {
			Rabbus.Responder.call( this, rabbus, {
				'exchange'    : 'req-res.exchange',
				'queue'       : 'req-res.users-queue',
				'messageType' : 'req-res.' + messageType
			} );
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
