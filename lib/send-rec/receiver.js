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

	var Rabbit = config.rabbit;
	var data   = mixins.getConsumerOptions( options, 'send-rec' );
	if ( data instanceof Error ) {
		process.nextTick( function () {
			this.emit( 'error', data );
		}.bind( this ) );
	} else {
		Rabbus.Receiver.call( this, Rabbit, data );
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

