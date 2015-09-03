'use strict';

/*
 * Collection of Responder Objects
 */

var _      = require( 'lodash' );
var util   = require( 'util' );
var events = require( 'events' );

/*
 * Collection of responders, an EventEmitter Class
 * Primarily used in supporting an array of messageType the responder
 * listens to.
 */

function ResponderCollection () {
	this.responders = [];
}

util.inherits( ResponderCollection, events.EventEmitter );

/*
 * every add listen to error and ready
 * TODO : find a way to remove listeners
 */
ResponderCollection.prototype.add = function ( responder ) {
	var that = this;
	this.responders.push( responder );
	responder.on( 'error', function ( error ) {
		that.emit( 'error', error );
	} );
	responder.on( 'ready', function () {
		that.emit( 'ready', responder );
	} );
};

ResponderCollection.prototype.consume = function ( callback ) {
	_.forEach( this.responders, function ( responder ) {
		responder.consume( callback );
	} );
};

ResponderCollection.prototype.length = function () {
	return this.responders.length;
};

module.exports = ResponderCollection;
