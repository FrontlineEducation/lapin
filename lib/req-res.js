'use strict';

var mixins    = require( './util/mixins' );
var Requester = require( './req-res/requester' );
var Responder = require( './req-res/responder' );

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

		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Responder( options );
		}
		return cache.consumers[ options.messageType ].consume( callback );
	}

	return {
		'request' : getRequesterAndProduce,
		'respond' : getResponderAndConsume
	};

};

