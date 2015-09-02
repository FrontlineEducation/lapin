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
	this.messageType = options.messageType;
	var Rabbit       = config.rabbit;
	var parts        = mixins.extract( this.messageType );

	if ( parts instanceof Error ) {
		this.emitError( parts );
	} else {
		Rabbus.Subscriber.call( this, Rabbit, {
			// should handle dynamic autoDelete in the future
			'exchange'    : 'pub-sub.' + parts.resource + '-exchange',
			'queue'       : 'pub-sub.' + parts.resource + '-queue',
			'messageType' : 'pub-sub.' + this.messageType
		} );
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

