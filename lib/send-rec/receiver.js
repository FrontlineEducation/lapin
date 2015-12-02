'use strict';

var Rabbus = require( 'rabbus' );
var util   = require( 'util' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );
var logger = require( '../logger' );

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

	var data = mixins.getConsumerOptions( options, 'send-rec' );
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
	this.receive( callback );

	/*
	* TODO: Log nack or error emitted
	* logger not yet defined
	*/

	return this;
};

module.exports = Receiver;

