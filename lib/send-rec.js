'use strict';

var mixins   = require( './util/mixins' );
var Sender   = require( './send-rec/sender' );
var Receiver = require( './send-rec/receiver' );

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
		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Receiver( options );
		}
		return cache.consumers[ options.messageType ].consume( callback );
	}

	return {
		'send'    : getSenderAndProduce,
		'receive' : getReceiverAndConsume
	};

};
