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

	this.messageType = options.messageType;
	var parts        = mixins.extract( this.messageType );
	var Rabbit       = config.rabbit;

	if ( parts instanceof Error ) {
		this.emit( 'error', parts );
	} else {
		Rabbus.Sender.call( this, Rabbit, {
			'exchange'    : 'send-rec.' + parts.resource + '-exchange',
			'messageType' : 'send-rec.' + this.messageType
		} );
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

