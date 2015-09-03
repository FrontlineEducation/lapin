'use strict';

var EventEmitter = require( 'events' ).EventEmitter;
var mixins       = require( './util/mixins' );
var Publisher    = require( './pub-sub/publisher' );
var consumer     = require( './util/consumer' );

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
		// can't support array of msgType when not in config structure
		if ( options instanceof Error ) {
			var emitter = new EventEmitter();
			process.nextTick( function () {
				emitter.emit( 'error', options );
			} );
			return emitter;
		}

		var consumerOptions = {
			'name'  : 'subscriber',
			'cache' : cache.consumers
		};
		return consumer.get( options, consumerOptions, callback );
	}

	return {
		'publish'   : getPublisherAndProduce,
		'subscribe' : getSubscriberAndConsume
	};

};
