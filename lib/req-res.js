'use strict';

var consumer     = require( './util/consumer' );
var mixins       = require( './util/mixins' );
var Requester    = require( './req-res/requester' );
var EventEmitter = require( 'events' ).EventEmitter;

module.exports = function ReqRes () {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	// Producer
	function getRequesterAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Requester( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	// Consumer
	function getResponderAndConsume ( options, callback ) {
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

