'use strict';

const mixins = require( './util/mixins' );
let Sender   = require( './send-rec/sender' );
let consumer = require( './util/consumer' );

module.exports = function SendReceive () {
	let cache = {
		'producers' : { },
		'consumers' : { }
	};

	function getSenderAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );
		if ( !options || !options.messageType ) {
			const sender = new Sender( options );

			return sender.produce( message, callback );
		}

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Sender( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	function getReceiverAndConsume ( options, callback ) {
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
			'name'  : 'receiver',
			'cache' : cache.consumers
		};

		return consumer.get( options, consumerOptions, callback );
	}

	return {
		'send'    : getSenderAndProduce,
		'receive' : getReceiverAndConsume
	};
};
