'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

function onErrorEmit ( rabbit, callback ) {
	var listener = function ( reqresError ) {
		callback( {
			'status'  : 'error',
			'message' : 'Request error',
			'data'    : reqresError
		}, null );
	};
	rabbit.once( 'error', listener );
	return listener;
}

module.exports = function ReqRes ( Rabbit ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	// Requester
	// --------
	function Requester ( options ) {

		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		Rabbus.Requester.call( this, Rabbit, {
			'exchange'    : 'req-res.' + parts.resource + '-exchange',
			'messageType' : 'req-res.' + this.messageType
		} );
	}

	util.inherits( Requester, Rabbus.Requester );

	// Instance Methods
	// ----------------
	Requester.prototype.produce = function ( message, callback ) {

		if ( !message || message === 'undefined' ) {
			return callback( {
				'status'  : 'error',
				'message' : 'Invalid data.'
			}, null );
		}

		var listener = onErrorEmit( this, callback ); // Listen to error emitted
		this.request( message, function ( response ) {
			var error = null;

			if ( response.status !== 'success' ) {
				error    = response;
				response = null;
			}

			callback( error, response );

			// remove error listener
			this.removeListener( 'error', listener );
		}.bind( this ) );

		return this;
	};

	function getRequesterAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Requester( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	// Responder
	// ---------
	function Responder ( options ) {
		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		Rabbus.Responder.call( this, Rabbit, {
			'exchange'    : 'req-res.' + parts.resource + '-exchange',
			'queue'       : 'req-res.' + parts.resource + '-queue',
			'messageType' : 'req-res.' + this.messageType
		} );
	}

	util.inherits( Responder, Rabbus.Responder );

	// Instance Methods
	// ----------------
	Responder.prototype.consume = function ( callback ) {

		this.handle( callback );

		/*
		* TODO: Log nack or error emitted
		* We can't call callback and pass error msg because
		* we don't have the reply(). reply() is only available when message
		* is properly ack.
		*/

		return this;
	};

	function getResponderAndConsume ( options, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Responder( options );
		}
		return cache.consumers[ options.messageType ].consume( callback );
	}

	return {
		'request' : getRequesterAndProduce,
		'respond' : getResponderAndConsume
	};

};
