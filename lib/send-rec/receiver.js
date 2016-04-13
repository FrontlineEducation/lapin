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
Receiver.prototype.consume = function ( callback ) {
	const that = this;

	this.receive( function ( message, done ) {
		const recOptions = {
			message,
			'consume'     : done,
			'log'         : that.logger,
			'messageType' : that.messageType,
			'emitter'     : that
		};

		callback( message, requestStatus( recOptions ) );
	} );

	return this;
};

module.exports = Receiver;

