'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

module.exports = function PubSub ( pubSubOptions ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	var Rabbit = pubSubOptions.rabbit || pubSubOptions; // only rabbit

	// Publisher
	// ---------
	function Publisher ( options ) {
		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		Rabbus.Publisher.call( this, Rabbit, {
			'exchange'    : 'pub-sub.' + parts.resource + '-exchange',
			'messageType' : 'pub-sub.' + this.messageType
		} );
	}

	util.inherits( Publisher, Rabbus.Publisher );

	// Instance Methods
	// ----------------
	Publisher.prototype.produce = function ( message, callback ) {

		if ( !message || message === 'undefined' ) {
			return callback( {
				'status'  : 'error',
				'message' : 'Invalid data'
			}, null );
		}

		this.publish( message, function () {
			callback();
		}.bind( this ) );

		return this;
	};

	function getPublisherAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Publisher( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	// Subscriber
	// ----------
	function Subscriber ( options ) {
		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		Rabbus.Subscriber.call( this, Rabbit, {
			// should handle dynamic autoDelete in the future
			'exchange'    : 'pub-sub.' + parts.resource + '-exchange',
			'queue'       : 'pub-sub.' + parts.resource + '-queue',
			'messageType' : 'pub-sub.' + this.messageType
		} );
	}

	util.inherits( Subscriber, Rabbus.Subscriber );

	// Instance Methods
	// ----------------
	Subscriber.prototype.consume = function ( callback ) {
		this.subscribe( callback );

		/*
		* TODO: Log nack or error emitted
		* logger not yet defined
		*/

		return this;
	};

	function getSubscriberAndConsume ( options, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Subscriber( options );
		}
		return cache.consumers[ options.messageType ].consume( callback );
	}

	return {
		'publish'   : getPublisherAndProduce,
		'subscribe' : getSubscriberAndConsume
	};

};
