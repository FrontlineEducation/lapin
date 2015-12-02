'use strict';

var Rabbus  = require( 'rabbus' );
var util    = require( 'util' );
var mixins  = require( '../util/mixins' );
var config  = require( '../config' );
var logger  = require( '../logger' );
var replies = require( '../util/replies' );

/*
	Publisher
	@options params
		exchange
		messageType
		autoDelete
 */
function Publisher ( options ) {

	var data = mixins.getProducerOptions( options, 'pub-sub' );
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
		replies.errorOptions( callback, this, message );
	}

	if ( !message ) {
		replies.invalidData( callback, this, message );
	}

	this.publish( message, callback );

	return this;
};

module.exports = Publisher;

