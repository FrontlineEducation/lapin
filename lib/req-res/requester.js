'use strict';

var util    = require( 'util' );
var Rabbus  = require( 'rabbus' );
var mixins  = require( '../util/mixins' );
var config  = require( '../config' );
var logger  = require( '../logger' );
var replies = require( '../util/replies' );

/*
	Requester
	@ params options ( below for requester )
		exchange
		messageType
		autoDelete
		routingKey
		forceAck
 */
function Requester ( options ) {

	var data = mixins.getProducerOptions( options, 'req-res' );
	if ( data instanceof Error ) {
		this.error = data;
	}

	Rabbus.Requester.call( this, config.rabbit, data );
	this.logger = logger( { 'emitter' : this } );
}

util.inherits( Requester, Rabbus.Requester );

// Instance Methods
// ----------------
Requester.prototype.produce = function ( message, callback ) {

	if ( this.error ) {
		return replies.errorOptions( callback, this, message );
	}

	if ( !message ) {
		return replies.invalidData( callback, this, message );
	}

	this.request( message, function ( response ) {
		var error = null;

		if ( response.status !== 'success' ) {
			error    = response;
			response = null;
		}
		callback( error, response );
	} );

	return this;
};

module.exports = Requester;
