'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

module.exports = function SendReceive ( Rabbit ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	// Sender
	// ------
	function Sender ( options ) {
		if ( !cache.producers[ options.messageType ] ) {
			this.messageType = options.messageType;
			var parts        = mixins.extract( this.messageType );

			Rabbus.Sender.call( this, Rabbit, {
				'exchange'    : 'send-rec.' + parts.resource + '-exchange',
				'messageType' : 'send-rec.' + this.messageType
			} );

			cache.producers[ this.messageType ] = this;
		}

		return this;
	}

	util.inherits( Sender, Rabbus.Sender );

	// Instance Methods
	// ----------------
	Sender.prototype.produce = function ( message, callback ) {
		cache.producers[ this.messageType ].send( message, function () {
			callback( null, {
				'status'  : 'success',
				'message' : 'message sent'
			} );
		} );
	};

	// Receiver
	// --------
	function Receiver ( options ) {
		if ( !cache.consumers[ options.messageType ] ) {
			this.messageType = options.messageType;
			var parts         = mixins.extract( this.messageType );

			Rabbus.Receiver.call( this, Rabbit, {
				'exchange'    : 'send-rec.' + parts.resource + '-exchange',
				'queue'       : 'send-rec.' + parts.resource + '-queue',
				'messageType' : 'send-rec.' + this.messageType
			} );

			cache.consumers[ this.messageType ] = this;
		}

		return this;
	}

	util.inherits( Receiver, Rabbus.Receiver );

	// Instance Methods
	// ----------------
	Receiver.prototype.consume = function ( callback ) {
		cache.consumers[ this.messageType ].receive( callback );
	};

	return {
		'Sender'   : Sender,
		'Receiver' : Receiver
	};

};
