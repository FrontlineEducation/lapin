'use strict';

const Rabbus  = require( 'rabbus' );
const util    = require( 'util' );
const mixins  = require( '../util/mixins' );
const config  = require( '../config' );
const replies = require( '../util/replies' );

let logger = require( '../logger' );

/*
	Publisher
	@options params
		exchange
		messageType
		autoDelete
 */
function Publisher ( options ) {
	const data = mixins.getProducerOptions( options, 'pub-sub' );

	if ( data instanceof Error ) {
		this.error = data;
	}

	Rabbus.Publisher.call( this, config.rabbit, data );
	this.logger = logger( { 'emitter' : this } );
}

util.inherits( Publisher, Rabbus.Publisher );

// Instance Methods
// ----------------
Publisher.prototype.produce = function ( message, callback ) {
	if ( this.error ) {
		return replies.errorOptions( callback, this, message );
	}

	if ( !message ) {
		return replies.invalidData( callback, this, message );
	}

	this.publish( message, callback );

	return this;
};

module.exports = Publisher;

