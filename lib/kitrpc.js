'use strict';

/**
 * Module dependencies
 */
var amqp        = require( 'amqplib' );
var Promise     = require( 'bluebird' );
var querystring = require( 'querystring' );
var util        = require( 'util' );
var extend      = require( 'util' )._extend;
var uuid        = require( 'node-uuid' ).v4;
var os          = require( 'os' );

var Queue = require( './queue' );
var json  = require( './formatter' );

/**
 * Main RPC application
 * @param {Object} options RPC options
 */
function KitRPC ( options ) {
	options = options || {};

	var self = this;

	options.url   = options.url || process.env.RABBITMQ_URL || 'amqp://localhost';
	options.vhost = options.vhost || process.env.RABBITMQ_VHOST || '/';

	this.replyQueue      = options.replyQueue || this.generateReplyQueue();
	this.replyQueueError = this.replyQueue + ':error';
	this.channels        = [];
	this.callbacks       = {};
	this.queues          = {};

	var vhost = util.format( '/%s', querystring.escape( options.vhost ) );
	var url   = util.format( '%s%s', options.url, vhost );

	this.init = new Promise( function ( resolve, reject ) {
		// Initialize connection and setup sender and listener channels
		amqp.connect( url ).then( function ( conn ) {

			self.connection = conn;

			process.once( 'SIGINT', function () {
				console.log( 'Closing channels and connection' );
				self.channels.forEach( function ( channel ) {
					channel.close();
				} );
				conn.close();
			} );

			function channelError ( err ) {
				console.log( err.toString() );
				reject();
			}

			function done () {
				if ( self.channels.length === 2 ) {
					resolve();
				}
			}

			self.connection.createChannel().then( function ( channel ) {
				channel.on( 'error', channelError );
				self.listenChannel = channel;
				self.channels.push( channel );
				done();
			} );

			self.connection.createChannel().then( function ( channel ) {
				channel.on( 'error', channelError );
				self.sendChannel = channel;
				self.channels.push( channel );
				done();
			} );

		} ).then( function () {
			console.log( 'Established connection to rabbitmq on', url );
		}, function ( err ) {
			console.log( 'Error connecting to', url, err.toString() );

			reject( err );
		} );

	} );

	this.callbackQueue();
}

KitRPC.prototype.setOptions = function ( queueName, options ) {
	extend( options, {
		'rpc'           : this,
		'formatter'     : json,
		'queueName'     : queueName,
		'sendChannel'   : this.sendChannel,
		'listenChannel' : this.listenChannel
	} );
};

KitRPC.prototype.callbackQueue = function () {
	this.listen( this.replyQueue, this.callbackHandler.bind( this ) );
};

KitRPC.prototype.callbackHandler = function ( message ) {
	var correlationId = message.properties.correlationId;

	if ( this.callbacks[ correlationId ] ) {
		if ( message.content.type && message.content.type === 'error' ) {
			this.callbacks[ correlationId ]( new Error( message.content.message ) );
		} else {
			this.callbacks[ correlationId ]( null, message );
		}

		delete this.callbacks[ correlationId ];
	}
};

KitRPC.prototype.generateReplyQueue = function () {
	return os.hostname() + ':' + process.pid + ':callback';
};

KitRPC.prototype.exec = function ( queue, message, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options  = {};
	}

	this.init.done( function () {
		var sendOpts = {
			'correlationId' : options.correlationId || uuid(),
			'replyTo'       : options.replyTo || this.replyQueue
		};

		if ( this.queues[ queue ] === undefined ) {
			this.setOptions( queue, options );
			this.queues[ queue ] = new Queue( options );
		}

		this.callbacks[ sendOpts.correlationId ] = callback;

		this.queues[ queue ].send( message, sendOpts );

	}.bind( this ) );
};

KitRPC.prototype.add = function ( queue, options, callback ) {
	this.listen.apply( this, arguments );
};

KitRPC.prototype.send = function ( queue, message, options ) {
	options = options || {};

	this.init.done( function () {

		var sendOpts = {
			'correlationId' : options.correlationId
		};

		if ( this.queues[ queue ] === undefined ) {
			this.setOptions( queue, options );
			this.queues[ queue ] = new Queue( options );
		}

		this.queues[ queue ].send( message, sendOpts );

	}.bind( this ) );
};

KitRPC.prototype.listen = function ( queue, options, callback ) {
	options = options || {};

	if ( typeof options === 'function' ) {
		callback = options;
		options  = {};
	}

	this.init.done( function () {

		if ( this.queues[ queue ] === undefined ) {
			this.setOptions( queue, options );
			this.queues[ queue ] = new Queue( options );
		}

		this.queues[ queue ].listen( callback );

	}.bind( this ) );
};

module.exports = KitRPC;
