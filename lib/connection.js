'use strict';

var amqp        = require( 'amqplib' );
var Promise     = require( 'bluebird' );
var querystring = require( 'querystring' );
var util        = require( 'util' );

function ampqUri( protocol, user, password, host, port, vhost ) {
	return util.format(
		'%s://%s:%s@%s:%s/%s',
		protocol, user, password, host, port, querystring.escape( vhost )
	);
}

/**
 * AMQP Connection Class
 */

function Connection ( options ) {
	options = options || {};

	this.protocol = options.secure ? 'amqps' : 'amqp';
	this.host     = options.host || 'localhost';
	this.user     = options.user || 'guest';
	this.password = options.password || 'guest';
	this.port     = options.port || 5672;
	this.vhost    = options.vhost || '/';
}

Connection.prototype.connect = function () {
	var url = ampqUri( this.protocol, this.user, this.password, this.host, this.port, this.vhost );

	return new Promise( function ( resolve, reject ) {
		amqp.connect( url ).then( resolve ).then( null, reject );
	} );
}

module.exports = Connection;
