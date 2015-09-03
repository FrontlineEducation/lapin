'use strict';

var Rabbus = require( 'rabbus' );
var util   = require( 'util' );
var mixins = require( '../util/mixins' );
var config = require( '../config' );

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
	}
}

util.inherits( Publisher, Rabbus.Publisher );

// Instance Methods
// ----------------
Publisher.prototype.produce = function ( message, callback ) {

	if ( !message || message === 'undefined' ) {
		return callback( {
			'status'  : 'fail',
			'message' : 'Invalid data'
		}, null );
	}

	this.publish( message, callback );

	return this;
};

module.exports = Publisher;

