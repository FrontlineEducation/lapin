'use strict';

var EventEmitter = require( 'events' ).EventEmitter;
var mixins       = require( './util/mixins' );
var Sender       = require( './send-rec/sender' );
var consumer     = require( './util/consumer' );

module.exports = function SendReceive () {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	function getSenderAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );
		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Sender( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	function getReceiverAndConsume ( options, callback ) {
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
