'use strict';

var Rabbus = require( 'rabbus' );
var util   = require( 'util' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );

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

	this.messageType = options.messageType;
	var parts        = mixins.extract( this.messageType );
	var Rabbit       = config.rabbit;

	if ( parts instanceof Error ) {
		this.emit( 'error', parts );
	} else {
		Rabbus.Receiver.call( this, Rabbit, {
			'exchange'    : 'send-rec.' + parts.resource + '-exchange',
			'queue'       : 'send-rec.' + parts.resource + '-queue',
			'messageType' : 'send-rec.' + this.messageType
		} );
	}
}

util.inherits( Receiver, Rabbus.Receiver );

// Instance Methods
// ----------------
Receiver.prototype.consume = function ( callback ) {
	this.receive( callback );

	/*
	* TODO: Log nack or error emitted
	* logger not yet defined
	*/

	return this;
};

module.exports = Receiver;

