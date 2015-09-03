'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );

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
	}
}

util.inherits( Sender, Rabbus.Sender );

// Instance Methods
// ----------------
Sender.prototype.produce = function ( message, callback ) {

	if ( !message || message === 'undefined' ) {
		return callback( {
			'status'  : 'fail',
			'message' : 'Invalid data'
		}, null );
	}

	this.send( message, function () {
		callback( null, {
			'status'  : 'success',
			'message' : 'Message sent'
		} );

	} );

	return this;
};

module.exports = Sender;

