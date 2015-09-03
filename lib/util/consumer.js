'use strict';

var _                  = require( 'lodash' );
var ConsumerCollection = require( '../collection/responder-collection' );
var Responder          = require( '../req-res/responder' );
var Receiver           = require( '../send-rec/receiver' );
var Subscriber         = require( '../pub-sub/subscriber' );

function morphConsumer ( consumer ) {
	if ( consumer === 'responder' ) {
		return Responder;
	} else if ( consumer === 'subscriber' ) {
		return Subscriber;
	} else if ( consumer === 'receiver' ) {
		return Receiver;
	}
}

module.exports = {
	'get' : function ( options, consumer, callback ) {
		var responder;
		if ( Array.isArray( options.messageType ) ) {
			responder = this.getCollection( options, consumer, callback );
		} else if ( !consumer.cache[ options.messageType ]  ) {
			responder = this.getNew( options, consumer, callback );
		} else {
			responder = this.getCached( options, consumer, callback );
		}
		return responder;
	},

	'getNew' : function getNew ( options, consumer, callback ) {
		var Consumer = morphConsumer( consumer.name );
		consumer.cache[ options.messageType ] = new Consumer( options );
		return consumer.cache[ options.messageType ].consume( callback );
	},

	'getCached' : function getCached ( options, consumer, callback ) {
		var res = consumer.cache[ options.messageType ].consume( callback );
		return res;
	},

	'getCollection' : function getCollection ( options, consumer, callback ) {
		// search in the cache if not found create then create a Collection return collection
		var collection = new ConsumerCollection();
		_.forEach( options.messageType, function ( key ) {
			var responder = consumer.cache[ key ];
			if ( !responder ) { // if not found in cache
				var clone             = _.cloneDeep( options );
				clone.messageType     = key;
				var Consumer          = morphConsumer( consumer.name );
				responder             = new Consumer( clone );
				consumer.cache[ key ] = responder;
			}
			collection.add( responder );
		} );
		setImmediate( function () { // give time for collection to listen
			collection.consume( callback );
		}  );
		return collection;
	}
};
