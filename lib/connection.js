'use strict';

var amqp         = require( 'amqplib' );
var Promise      = require( 'bluebird' );
var EventEmitter = require( 'events' ).EventEmitter;
var querystring  = require( 'querystring' );
var util         = require( 'util' );

var format   = util.format;
var inherits = util.inherits;

function uri( protocol, user, password, host, port, vhost ) {
	return format(
		'%s://%s:%s@%s:%s/%s',
		protocol, user, password, host, port, querystring.escape( vhost )
	);
}

/**
 * AMQP Connection Class
 */
function Connection ( options ) {
	EventEmitter.call( this );

	options = options || {};

	this.protocol = options.secure ? 'amqps' : 'amqp';
	this.host     = options.host || 'localhost';
	this.user     = options.user || 'guest';
	this.password = options.password || 'guest';
	this.port     = options.port || 5672;
	this.vhost    = options.vhost || '/';

	this.url = uri( this.protocol, this.user, this.password, this.host, this.port, this.vhost );

	this.reset();
}

inherits( Connection, EventEmitter );

Connection.prototype.reset = function () {
	this.ready = new Promise( function ( resolve, reject ) {
		this._resolve = resolve;
		this._reject  = reject;
	}.bind( this ) );
};

Connection.prototype.connect = function () {
	var self = this;
	// Prevents connection error from being swallowed by the promise machinery.
	var onError = function ( err ) {
		setImmediate( function () {
			self.emit( 'error', err );
		} );
	};
	var conn = amqp.connect( this.url );
	conn.then( function ( resource ) {
		resource.on( 'error', onError );
		self.emit( 'connected' );
		[ 'close', 'blocked', 'unblocked' ].forEach( function ( evt ) {
			resource.on( evt, self.emit.bind( self, evt ) );
		} );
	} );
	conn.then( this._resolve ).then( null, this._reject );

	return this.ready;
};

Connection.prototype.reconnect = function () {
	this.reset();
	return this.connect();
};

Connection.prototype.close = function ( callback ) {
	this.ready.then( function ( conn ) {
		conn.close().then( callback );
	} );
};

module.exports = Connection;
