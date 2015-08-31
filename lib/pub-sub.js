'use strict';

var mixins     = require( './util/mixins' );
var Publisher  = require( './pub-sub/publisher' );
var Subscriber = require( './pub-sub/subscriber' );

module.exports = function PubSub () {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	function getPublisherAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Publisher( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

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
