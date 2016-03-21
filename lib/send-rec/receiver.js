'use strict';

var Rabbus        = require( 'rabbus' );
var util          = require( 'util' );
var mixins        = require( '../util/mixins' );
var config        = require( '../config' );
var logger        = require( '../logger' );
var requestStatus = require( './status' );

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

	// todo: manual here but update to latest rabbus for routingKey
	data.routingKey = data.messageType;

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
	var that = this;
	this.receive( function ( message, done ) {
		var recOptions = {
			'consume'     : done,
			'log'         : that.logger,
			'messageType' : that.messageType,
			'message'     : message,
			'emitter'     : that
		};
		callback( message, requestStatus( recOptions ) );
	} );

	return this;
};

module.exports = Receiver;

