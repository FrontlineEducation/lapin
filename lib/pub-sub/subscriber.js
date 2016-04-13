'use strict';

const util   = require( 'util' );
const Rabbus = require( 'rabbus' );
const mixins = require( '../util/mixins' );
const config = require( '../config' );

let logger = require( '../logger' );

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
	const data   = mixins.getConsumerOptions( options, 'pub-sub' );

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

