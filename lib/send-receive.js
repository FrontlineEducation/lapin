'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

function onErrorEmit ( rabbit, callback ) {
	var listener = function ( reqresError ) {
		callback( {
			'status'  : 'error',
			'message' : 'Send error',
			'data'    : reqresError
		}, null );
	};
	rabbit.once( 'error', listener );
	return listener;
}

module.exports = function SendReceive ( sendRecOptions ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	var Rabbit = sendRecOptions.rabbit || sendRecOptions; // only rabbit

	// Sender
	// ------
	function Sender ( options ) {
		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		Rabbus.Sender.call( this, Rabbit, {
			'exchange'    : 'send-rec.' + parts.resource + '-exchange',
			'messageType' : 'send-rec.' + this.messageType
		} );
	}

	util.inherits( Sender, Rabbus.Sender );

	// Instance Methods
	// ----------------
	Sender.prototype.produce = function ( message, callback ) {

		if ( !message || message === 'undefined' ) {
			return callback( {
				'status'  : 'error',
				'message' : 'Invalid data'
			}, null );
		}

		var listener = onErrorEmit( this, callback ); // Listen to error emitted
		this.send( message, function () {
			callback( null, {
				'status'  : 'success',
				'message' : 'Message sent'
			} );

			// remove error listener
			this.removeListener( 'error', listener );
		}.bind( this ) );

		return this;
	};

	function getSenderAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );
		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Sender( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	// Receiver
	// --------
	function Receiver ( options ) {
		this.messageType = options.messageType;
		var parts         = mixins.extract( this.messageType );

		Rabbus.Receiver.call( this, Rabbit, {
			'exchange'    : 'send-rec.' + parts.resource + '-exchange',
			'queue'       : 'send-rec.' + parts.resource + '-queue',
			'messageType' : 'send-rec.' + this.messageType
		} );
	}

	util.inherits( Receiver, Rabbus.Receiver );

	// Instance Methods
	// ----------------
	Receiver.prototype.consume = function ( callback ) {
		this.receive( callback );

		/*
		* TODO: Log nack or error emitted
		* logger not yet defined
		*/

		return this;
	};

	function getReceiverAndConsume ( options, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );
		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Receiver( options );
		}
		return cache.consumers[ options.messageType ].consume( callback );
	}

	return {
		'send'    : getSenderAndProduce,
		'receive' : getReceiverAndConsume
	};

};
