'use strict';

const _       = require( 'lodash' );
const util    = require( 'util' );
const Rabbus  = require( 'rabbus' );
const mixins  = require( '../util/mixins' );
const config  = require( '../config' );
const replies = require( '../util/replies' );

let logger = require( '../logger' );

/*
	Requester
	@ params options ( below for requester )
		exchange
		messageType
		autoDelete
		routingKey
		forceAck
 */
function Requester ( options ) {
	const data = mixins.getProducerOptions( options, 'req-res' );

	this.logger = logger( { 'emitter' : this } );

	if ( data instanceof Error ) {
		this.error = data;
	} else {
		this.queue = mixins.getQueueName( options, 'req-res' );

		// listen to requester error
		this.on( 'error', ( errorReq ) => {
			this.logger.error( `Queue: ${this.queue}, ${errorReq.message}` );
		} );
	}

	Rabbus.Requester.call( this, config.rabbit, data );
}

util.inherits( Requester, Rabbus.Requester );

// Instance Methods
// ----------------
Requester.prototype.produce = function ( message, callback ) {
	if ( this.error ) {
		return replies.errorOptions( callback, this, message );
	}

	if ( !message ) {
		return replies.invalidData( callback, this, message );
	}

	/*
	 * check if message is of type Array
	 * wrapped it to an object, rabbot has issues with arrays
	 * https://github.com/arobson/rabbot/issues/19
	 */
	if ( _.isArray( message ) ) {
		message = { '_list!_' : message };
	}

	this.request( message, ( response ) => {
		try {
			let error = null;

			if ( response.status !== 'success' ) {
				error    = response;
				response = null;
			}
			callback( error, response );
		} catch ( errorReq ) {
			/*
			 * no need to invoke callback with error
			 * after timeout occurs, and responder will reply timeout
			 * we can't reject the message here we are using the old rabbus
			 * TODO:  use middleware and reject message, available in rabbus 0.7.0-up
			 */
			this.logger.error( `Queue: ${this.queue}, ${errorReq.message}` );
		}
	} );

	return this;
};

module.exports = Requester;
