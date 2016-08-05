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

	if ( data instanceof Error ) {
		this.error = data;
	}

	Rabbus.Requester.call( this, config.rabbit, data );
	this.logger = logger( { 'emitter' : this } );
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

	this.request( message, function ( response ) {
		let error = null;

		if ( response.status !== 'success' ) {
			error    = response;
			response = null;
		}
		callback( error, response );
	} );

	return this;
};

module.exports = Requester;
