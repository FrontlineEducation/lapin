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
		if ( !cache.producers[ options.messageType ] ) {
			this.messageType = options.messageType;
			var parts        = mixins.extract( this.messageType );

			Rabbus.Requester.call( this, Rabbit, {
				'exchange'    : 'req-res.' + parts.resource + '-exchange',
				'messageType' : 'req-res.' + this.messageType
			} );

			cache.producers[ this.messageType ] = this;
		}

		return this;
	}

	util.inherits( Requester, Rabbus.Requester );

	// Instance Methods
	// ----------------
	Requester.prototype.produce = function ( message, callback ) {
		cache.producers[ this.messageType ].request( message, function ( response ) {
			var error = null;

			if ( response.status !== 'success' ) {
				error = response;
				response  = null;
			}

			callback( error, response );
		} );
	};

	// Responder
	// ---------
	function Responder ( options ) {
		if ( !cache.consumers[ options.messageType ] ) {
			this.messageType = options.messageType;
			var parts        = mixins.extract( this.messageType );

			Rabbus.Responder.call( this, Rabbit, {
				'exchange'    : 'req-res.' + parts.resource + '-exchange',
				'queue'       : 'req-res.' + parts.resource + '-queue',
				'messageType' : 'req-res.' + this.messageType
			} );

			cache.consumers[ this.messageType ] = this;
		}

		return this;
	}

	util.inherits( Responder, Rabbus.Responder );

	// Instance Methods
	// ----------------
	Responder.prototype.consume = function ( callback ) {
		cache.consumers[ this.messageType ].handle( callback );
	};

	return {
		'Requester' : Requester,
		'Responder' : Responder
	};

};
