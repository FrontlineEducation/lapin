'use strict';

const mixins = require( './util/mixins' );

let Publisher = require( './pub-sub/publisher' );
let consumer  = require( './util/consumer' );

module.exports = function PubSub () {
	let cache = {
		'producers' : { },
		'consumers' : { }
	};

	function getPublisherAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !options || !options.messageType ) {
			const publisher = new Publisher( options );

			return publisher.produce( message, callback );
		}

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Publisher( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	function getSubscriberAndConsume ( options, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !options ) {
			throw new Error( 'Invalid messageType' );
		}

		// can't support array of msgType when not in config structure
		if ( options instanceof Error ) {
			throw options;
		}

		const consumerOptions = {
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
