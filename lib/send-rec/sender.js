'use strict';

var util    = require( 'util' );
var Rabbus  = require( 'rabbus' );
var mixins  = require( '../util/mixins' );
var config  = require( '../config' );
var logger  = require( '../logger' );
var replies = require( '../util/replies' );

/*
	Sender
	@params options
		exchange
		messageType
		routingKey
		autoDelete
 */
function Sender ( options ) {

	var data = mixins.getProducerOptions( options, 'send-rec' );
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

		setImmediate( function () {
			this.logger.silly( 'sent', {
				'data'        : 'Message Sent',
				'messageType' : this.messageType,
				'msg'         : mixins.cloneDeep( message ) || {}
			} );
		}.bind( this ) );

		callback( null, {
			'status' : 'success',
			'data'   : 'Message sent'
		} );

	}.bind( this ) );

	return this;
};

module.exports = Sender;

