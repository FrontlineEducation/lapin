'use strict';

var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var extend       = util._extend;

/**
 * A Simple state object for managing lifecycle of amqp connection and channels.
 */

function State ( transitions ) {

	EventEmitter.call( this );

	extend( this, transitions );

	if ( this.setup ) {
		setImmediate( function () {
			this.setup();
		}.bind( this ) );
	}
}

util.inherits( State, EventEmitter );

module.exports = State;
