'use strict';

const util    = require( 'util' );
const Rabbus  = require( 'rabbus' );
const mixins  = require( '../util/mixins' );
const config  = require( '../config' );
const replies = require( '../util/replies' );

let logger  = require( '../logger' );

/*
	Sender
	@params options
		exchange
		messageType
		routingKey
		autoDelete
 */

function Sender ( options ) {
	let data = mixins.getProducerOptions( options, 'send-rec' );

	// todo: manual here but update to latest rabbus for routingKey
	data.routingKey = data.messageType;

	if ( data instanceof Error ) {
		this.error = data;
	}

	Rabbus.Sender.call( this, config.rabbit, data );
	this.logger = logger( { 'emitter' : this } );
}

util.inherits( Sender, Rabbus.Sender );

// Instance Methods
// ----------------
Sender.prototype.produce = function ( message, callback ) {
	if ( this.error ) {
		return replies.errorOptions( callback, this, message );
	}

	if ( !message ) {
		return replies.invalidData( callback, this, message );
	}

	this.send( message, function () {
		callback( null, {
			'status' : 'success',
			'data'   : 'Message sent'
		} );

		setImmediate( function () {
			this.logger.silly( 'sent', {
				'data'        : 'Message Sent',
				'messageType' : this.messageType,
				'msg'         : mixins.cloneDeep( message ) || {}
			} );
		}.bind( this ) );
	}.bind( this ) );

	return this;
};

module.exports = Sender;

