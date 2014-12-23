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

		amqp.connect( url ).then( function ( conn ) {

			self.connection = conn;

			process.once( 'SIGINT', function () {
				console.log( 'Closing channels and connection' );
				self.channels.forEach( function ( channel ) {
					channel.close();
				} );
				conn.close();
			} );

		} ).then( function () {
			console.log( 'Established connection to rabbitmq on', url );

			resolve();
		}, function ( err ) {
			console.log( 'Error connecting to', url, err.toString() );

			reject( err );
		} );

	} );

	this.callbackQueue();
}

KitRPC.prototype.startQueue = function ( queueName, options ) {
	var self = this;

	return new Promise( function ( resolve, reject ) {

		self.init.done( function () {

			var channels = {};

			if ( self.queues[ queueName ] !== undefined ) {
				return resolve( self.queues[ queueName ] );
			}

			function channelError ( err ) {
				console.log( err.toString() );
				reject();
			}

			function done () {
				if ( channels.listenChannel && channels.sendChannel ) {
					self.setOptions( queueName, channels, options );
					self.queues[ queueName ] = new Queue( options );

					resolve( self.queues[ queueName ] );
				}
			}

			self.connection.createChannel().then( function ( channel ) {
				channel.on( 'error', channelError );
				channels.listenChannel = channel;

				self.channels.push( channel );
				done();
			} );

			self.connection.createChannel().then( function ( channel ) {
				channel.on( 'error', channelError );
				channels.sendChannel = channel;

				self.channels.push( channel );
				done();
			} );

		} );

	} );
};

KitRPC.prototype.setOptions = function ( queueName, channels, options ) {
	extend( options, {
		'rpc'           : this,
		'formatter'     : json,
		'queueName'     : queueName,
		'sendChannel'   : channels.sendChannel,
		'listenChannel' : channels.listenChannel
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

KitRPC.prototype.exec = function ( queueName, message, options, callback ) {
	if ( typeof options === 'function' ) {
		callback = options;
		options  = {};
	}

	this.startQueue( queueName, options ).done( function ( queue ) {
		var sendOpts = {
			'correlationId' : options.correlationId || uuid(),
			'replyTo'       : options.replyTo || this.replyQueue
		};

		this.callbacks[ sendOpts.correlationId ] = callback;
		queue.send( message, sendOpts );
	}.bind( this ) );
};

KitRPC.prototype.add = function ( queueName, options, callback ) {
	this.listen.apply( this, arguments );
};

KitRPC.prototype.send = function ( queueName, message, options ) {
	options = options || {};

	this.startQueue( queueName, options ).done( function ( queue ) {
		var sendOpts = {
			'correlationId' : options.correlationId
		};

		queue.send( message, sendOpts );
	} );
};

KitRPC.prototype.listen = function ( queueName, options, callback ) {
	options = options || {};

	if ( typeof options === 'function' ) {
		callback = options;
		options  = {};
	}

	this.startQueue( queueName, options ).done( function ( queue ) {
		queue.listen( callback );
	} );
};

module.exports = KitRPC;
