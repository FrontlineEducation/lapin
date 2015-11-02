'use strict';

var Rabbus = require( 'rabbus' );
var util   = require( 'util' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );
var logger = require( '../logger' );

/*
	Publisher
	@options params
		exchange
		messageType
		autoDelete
 */
function Publisher ( options ) {

	var Rabbit = config.rabbit;
	var data   = mixins.getProducerOptions( options, 'pub-sub' );
	if ( data instanceof Error ) {
		process.nextTick( function () {
			this.emit( 'error', data );
		}.bind( this ) );
	} else {
		Rabbus.Publisher.call( this, Rabbit, data );
		// logger
		this.logger = logger( { 'emitter' : this } );
	}
}

util.inherits( Publisher, Rabbus.Publisher );

// Instance Methods
// ----------------
Publisher.prototype.produce = function ( message, callback ) {

	if ( !message || message === 'undefined' ) {
		this.logger.warn( 'Invalid data' );
		return callback( {
			'status' : 'fail',
			'data'   : 'Invalid data'
		}, null );
	}

	this.publish( message, callback );

	return this;
};

module.exports = Publisher;

