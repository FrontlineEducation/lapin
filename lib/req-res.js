'use strict';

const mixins  = require( './util/mixins' );
let consumer  = require( './util/consumer' );
let Requester = require( './req-res/requester' );

module.exports = function ReqRes () {
	let cache = {
		'producers' : { },
		'consumers' : { }
	};

	// Producer
	function getRequesterAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !options || !options.messageType ) {
			const requester = new Requester( options );

			return requester.produce( message, callback );
		}

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Requester( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	// Consumer
	function getResponderAndConsume ( options, callback ) {
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
			'name'  : 'responder',
			'cache' : cache.consumers
		};

		return consumer.get( options, consumerOptions, callback );
	}

	return {
		'request' : getRequesterAndProduce,
		'respond' : getResponderAndConsume
	};
};

