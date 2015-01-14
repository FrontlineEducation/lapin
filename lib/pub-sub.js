'use strict';
/*
Fanout exchange type

 */
// Load core modules
var util = require( 'util' );

// Load third-party module
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );

module.exports = function PubSub ( Rabbit ) {
	var cache = {
		'publisher'  : { },
		'subscriber' : { }
	};

	/*
	Publisher wrapper class
	 */
	function Publisher ( messageType, message ) {

		var publisherCache = cache.publisher[ this.messageType ];
		if ( !publisherCache ) {
			var meta = mixins.extract( messageType );

			this.messageType = messageType;
			this.message     = message;

			Rabbus.Publisher.call( this, Rabbit, {
				// should handle dynamic autoDelete in the future
				'exchange'    : 'pub-sub.' + meta.resource + '-exchange',
				'messageType' : 'pub-sub.' + messageType,
				'autoDelete'  : true
			} );
			cache.publisher[ this.messageType ] = this;
		}
		return publisherCache;
	}

	util.inherits( Publisher, Rabbus.Publisher );

	Publisher.prototype.produce = function ( callback ) {
		this.publish( this.message, callback );
	};

	/*
	Subscriber wrapper class
	 */
	function Subscriber ( messageType, message ) {

		var subscriberCache = cache.subscriber[ this.messageType ];
		if ( !subscriberCache ) {
			var meta = mixins.extract( messageType );

			this.messageType = messageType;
			this.message     = message;

		/*
			For now  we attached a queue depending on resource
			should handle dynamic autoDelete in the future
		*/
			Rabbus.Subscriber.call( this, Rabbit, {
				// should handle dynamic autoDelete in the future
				'exchange'    : 'pub-sub.' + meta.resource + '-exchange',
				'queue'       : 'pub-sub.' + meta.resource + '-queue',
				'routingKey'  : 'pub-sub.' + meta.resource + '-route',
				'messageType' : 'pub-sub.' + messageType,
				'autoDelete'  : true
			} );
			cache.subscriber[ this.messageType ] = this;
		}

		return subscriberCache;
	}

	util.inherits( Subscriber, Rabbus.Subscriber );

	Subscriber.prototype.consume = function ( callback ) {
		this.subscribe( callback );
	};

	return {
		'Publisher'  : Publisher,
		'Subscriber' : Subscriber
	};

};
