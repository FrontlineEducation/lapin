'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

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
		this.request( message, function ( response ) {
			var error = null;

			if ( response.status !== 'success' ) {
				error = response;
				response  = null;
			}

			callback( error, response );
		} );
	};

	function getRequester ( options ) {
		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Requester( options );
		}
		return cache.producers[ options.messageType ];
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
	};

	function getResponder ( options ) {
		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Responder( options );
		}
		return cache.consumers[ options.messageType ];
	}

	return {
		'requester' : getRequester,
		'responder' : getResponder
	};

};
