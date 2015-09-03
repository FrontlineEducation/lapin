'use strict';

var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );

function emit ( emitter, event, params ) {
	emitter.emit( event, params );
}

function Producer () {}

Producer.prototype.produce = function ( message, callback ) {
	callback( message );
};

function Consumer () {}

util.inherits( Consumer, EventEmitter );

Consumer.prototype.consume = function ( callback ) {
	callback( 'done' );
	setImmediate( emit, this, 'ready' );
	return this;
};

Consumer.prototype.consumeError = function ( callback ) {
	callback( 'error' );
	setImmediate( emit, this, 'error', new Error( 'consumer' ) );
	return this;
};

function getNewConsumer ( options, consumer, callback ) {
	var consumerNew = new Consumer();
	return consumerNew.consume( callback );
}

module.exports = {
	'Producer'       : Producer,
	'Consumer'       : Consumer,
	'getNewConsumer' : getNewConsumer
};

