'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );

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
	var Rabbit = config.rabbit;
	var data   = mixins.getConsumerOptions( options, 'pub-sub' );
	if ( data instanceof Error ) {
		process.nextTick( function () {
			this.emitError( data );
		}.bind( this ) );
	} else {
		Rabbus.Subscriber.call( this, Rabbit, data );
	}
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

