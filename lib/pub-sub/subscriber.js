'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );
var logger = require( '../logger' );

/*
	Subscriber
	@params options
		queue
		exchange
		messageType
		autoDelete
		limit
		noBatch
 */
function Subscriber ( options ) {
	var data   = mixins.getConsumerOptions( options, 'pub-sub' );
	if ( data instanceof Error ) {
		throw data;
	}
	Rabbus.Subscriber.call( this, config.rabbit, data );
	this.logger = logger( { 'emitter' : this } );
}

util.inherits( Subscriber, Rabbus.Subscriber );

// Instance Methods
// ----------------
Subscriber.prototype.consume = function ( callback ) {
	this.subscribe( callback );

	/*
	* TODO: Log nack or error emitted
	* logger not yet defined
	*/

	return this;
};

module.exports = Subscriber;

