'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );

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

	var Rabbit = config.rabbit;
	var data   = mixins.getProducerOptions( options, 'req-res' );
	if ( data instanceof Error ) {
		process.nextTick( function () {
			this.emit( 'error', data );
		}.bind( this ) );
	} else {
		Rabbus.Requester.call( this, Rabbit, data );
	}
}

util.inherits( Requester, Rabbus.Requester );

// Instance Methods
// ----------------
Requester.prototype.produce = function ( message, callback ) {

	// in the future this should be `fail`
	if ( !message || message === 'undefined' ) {
		return callback( {
			'status'  : 'fail',
			'message' : 'Invalid data'
		}, null );
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
