'use strict';

const Rabbus        = require( 'rabbus' );
const util          = require( 'util' );
const mixins        = require( '../util/mixins' );
const config        = require( '../config' );
const requestStatus = require( './status' );

let logger = require( '../logger' );

/*
	Receiver
	@params options
		queue
		exchange
		messageType
		autoDelete
		limit
		noBatch
 */
function Receiver ( options ) {
	let data = mixins.getConsumerOptions( options, 'send-rec' );

	// todo: manual here but update to latest rabbus for routingKey
	data.routingKey = data.messageType;

	if ( data instanceof Error ) {
		throw data;
	}

	Rabbus.Receiver.call( this, config.rabbit, data );
	this.logger = logger( { 'emitter' : this } );
}

util.inherits( Receiver, Rabbus.Receiver );

// Instance Methods
// ----------------
Receiver.prototype.inbound = function ( callback ) {
	const that = this;

	return new Promise( ( resolve, reject ) => {
		let send;

		this.on( 'error', ( onError ) => {
			if ( send ) {
				send.error( onError.message, onError );
			} else {
				console.log( 'Receive Error', onError );
			}
			reject( onError );
		} );

		this.receive( function ( message, done ) {
			const recOptions = {
				message,
				'consume'     : done,
				'log'         : that.logger,
				'messageType' : that.messageType,
				'emitter'     : that
			};

			send = requestStatus( recOptions );
			callback( message, send );
		} );
	} );
};

Receiver.prototype.consume = function ( callback ) {
	this.inbound( callback )
	.catch( () => {
		// only use for errors to be catched here and not on the lapin callee
	} );

	return this;
};

module.exports = Receiver;

