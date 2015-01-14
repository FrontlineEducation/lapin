'use strict';

// Load core modules
var util   = require( 'util' );
var mixins = require( './mixins' );

// Load third-party modules
var Rabbus = require( 'rabbus' );

module.exports = function SendReceive ( Rabbit ) {
	var cache = {
		'senders'   : { },
		'receivers' : { }
	};

	function send ( messageType, message, callback ) {

		function Sender ( rabbus ) {

			mixins.extract( messageType, function ( error, meta ) {

				if ( error ) {
					// Return error
					throw error;
				}
				// Create sender if valid messageType
				Rabbus.Sender.call( this, rabbus, {
					'exchange'    : 'send-rec.' + meta.resource + '-exchange',
					'messageType' : 'send-rec.' + messageType
				} );

			}.bind( this ) );

		}

		util.inherits( Sender, Rabbus.Sender );

		if ( !cache.senders[ messageType ] ) {
			cache.senders[ messageType ] = new Sender( Rabbit );
		}

		cache.senders[ messageType ].send( message, function () {

			// Confirmation for message send
			callback( null, {
				'status'  : 'success',
				'message' : 'message sent'
			} );

		} );

	}

	function receive ( messageType, callback ) {

		function Receiver ( rabbus ) {

			mixins.extract( messageType, function ( error, meta ) {

				if ( error ) {
					// Return error
					throw error;
				}

				// Create receiver if valid messageType
				Rabbus.Receiver.call( this, rabbus, {
					'exchange'    : 'send-rec.' + meta.resource + '-exchange',
					'queue'       : 'send-rec.' + meta.resource + '-queue',
					'messageType' : 'send-rec.' + messageType
				} );

			}.bind( this ) );

		}

		util.inherits( Receiver, Rabbus.Receiver );

		if ( !cache.receivers[ messageType ] ) {
			cache.receivers[ messageType ] = new Receiver( Rabbit );
		}

		cache.receivers[ messageType ].receive( callback );
	}

	return {
		'send'    : send,
		'receive' : receive
	};
};
