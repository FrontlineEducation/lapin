'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

module.exports = function PubSub ( Rabbit ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	// Publisher
	// ---------
	function Publisher ( options ) {
		if ( !cache.producers[ options.messageType ] ) {
			this.messageType = options.messageType;
			var parts        = mixins.extract( this.messageType );

			Rabbus.Publisher.call( this, Rabbit, {
				'exchange'    : 'pub-sub.' + parts.resource + '-exchange',
				'messageType' : 'pub-sub.' + this.messageType
			} );

			cache.producers[ this.messageType ] = this;
		}

		return this;
	}

	util.inherits( Publisher, Rabbus.Publisher );

	// Instance Methods
	// ----------------
	Publisher.prototype.produce = function ( message, callback ) {
		cache.producers[ this.messageType ].publish( message, callback );
	};

	// Subscriber
	// ----------
	function Subscriber ( options ) {
		if ( !cache.consumers[ options.messagetype ] ) {
			this.messageType = options.messageType;
			var parts        = mixins.extract( this.messageType );

			Rabbus.Subscriber.call( this, Rabbit, {
				// should handle dynamic autoDelete in the future
				'exchange'    : 'pub-sub.' + parts.resource + '-exchange',
				'queue'       : 'pub-sub.' + parts.resource + '-queue',
				'messageType' : 'pub-sub.' + this.messageType
			} );

			cache.consumers[ this.messageType ] = this;
		}

		return this;
	}

	util.inherits( Subscriber, Rabbus.Subscriber );

	// Instance Methods
	// ----------------
	Subscriber.prototype.consume = function ( callback ) {
		cache.consumers[ this.messageType ].subscribe( callback );
	};

	return {
		'Publisher'  : Publisher,
		'Subscriber' : Subscriber
	};

};
