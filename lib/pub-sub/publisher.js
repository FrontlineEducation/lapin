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

	this.messageType = options.messageType;
	var Rabbit       = config.rabbit;
	var parts        = mixins.extract( this.messageType );

	if ( parts instanceof Error ) {
		this.emitError( parts );
	} else {
		Rabbus.Publisher.call( this, Rabbit, {
			'exchange'    : 'pub-sub.' + parts.resource + '-exchange',
			'messageType' : 'pub-sub.' + this.messageType
		} );
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

