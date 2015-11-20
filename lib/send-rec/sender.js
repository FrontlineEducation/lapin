'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );
var logger = require( '../logger' );

/*
	Sender
	@params options
		exchange
		messageType
		routingKey
		autoDelete
 */
function Sender ( options ) {

	var Rabbit = config.rabbit;
	var data   = mixins.getProducerOptions( options, 'send-rec' );
	if ( data instanceof Error ) {
		process.nextTick( function () {
			this.emit( 'error', data );
		}.bind( this ) );
	} else {
		Rabbus.Sender.call( this, Rabbit, data );
		// logger
		this.logger = logger( { 'emitter' : this } );
	}
}

util.inherits( Sender, Rabbus.Sender );

// Instance Methods
// ----------------
Sender.prototype.produce = function ( message, callback ) {

	if ( !message || message === 'undefined' ) {

		setImmediate( function () {
			this.logger.warn( 'fail', {
				'data'        : 'Invalid data',
				'messageType' : this.messageType,
				'message'     : message
			} );
		}.bind( this ) );

		return callback( {
			'status' : 'fail',
			'data'   : 'Invalid data'
		}, null );
	}

	this.send( message, function () {

		setImmediate( function () {
			this.logger.silly( 'sent', {
				'data'        : 'Message Sent',
				'messageType' : this.messageType,
				'message'     : message
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

