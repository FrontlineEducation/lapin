'use strict';

/**
 * Functions for retrieving consumer ( cached | new | collection )
 */

const _                  = require( 'lodash' );
const ConsumerCollection = require( '../collection/responder-collection' );
const Receiver           = require( '../send-rec/receiver' );
const Subscriber         = require( '../pub-sub/subscriber' );

let Responder          = require( '../req-res/responder' );

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
	get ( options, consumer, callback ) {
		let responder;

		if ( Array.isArray( options.messageType ) ) {
			responder = this.getCollection( options, consumer, callback );
		} else if ( !consumer.cache[ options.messageType ]  ) {
			responder = this.getNew( options, consumer, callback );
		} else {
			responder = this.getCached( options, consumer, callback );
		}
		return responder;
	},

	getNew ( options, consumer, callback ) {
		const Consumer = morphConsumer( consumer.name );

		consumer.cache[ options.messageType ] = new Consumer( options );

		return consumer.cache[ options.messageType ].consume( callback );
	},

	getCached ( options, consumer, callback ) {
		const res = consumer.cache[ options.messageType ].consume( callback );

		return res;
	},

	getCollection ( options, consumer, callback ) {
		// search in the cache if not found, create a Collection of responders
		const collection = new ConsumerCollection();

		_.forEach( options.messageType, function ( key ) {
			let responder = consumer.cache[ key ];

			if ( !responder ) {
				// if not found in cache
				let clone = JSON.parse( JSON.stringify( options ) );

				clone.messageType = key;

				// point to original validate obj
				clone.validate = options.validate;

				const Consumer = morphConsumer( consumer.name );

				responder             = new Consumer( clone );
				consumer.cache[ key ] = responder;
			}
			collection.add( responder );
		} );

		// give time for collection to listen
		setImmediate( function () {
			collection.consume( callback );
		}  );
		return collection;
	}
};
