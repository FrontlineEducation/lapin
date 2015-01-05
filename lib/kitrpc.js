'use strict';

/**
 * Module dependencies
 */
var Promise = require( 'bluebird' );
var extend  = require( 'util' )._extend;
var uuid    = require( 'node-uuid' ).v4;
var os      = require( 'os' );

var Connection = require( './connection' );
var json       = require( './formatter' );
var State      = require( './state' );
var Topology   = require( './topology' );

/**
 * Main RPC application
 * @param {Object} options RPC options
 */
function KitRPC ( options ) {
	options = options || {};

	this.replyQueue = options.replyQueue || this.generateReplyQueue();
	this.callbacks  = {};

	var connection = new Connection( options );

	/**
	 *  Wrapping connection with a state machine object.
	 *  Handles reconnection of an amqp connection.
	 */
	var connState = new State( {
		'setup' : function () {
			this.waitInterval = options.waitInterval || 5000;
			this.connection   = null;

			connState.acquire();
		},

		'acquire' : function () {
			connState.emit( 'acquiring' );

			connection.connect().then( function ( conn ) {
				connState.connected( conn );
			} ).catch( function ( err ) {
				connState.reconnect( err );
			} );
		},

		'connected' : function ( conn ) {
			connState.emit( 'connected', conn );

			this.connection = conn;

			this.connection.once( 'error', connState.error.bind( this ) );
			this.connection.once( 'close', connState.release.bind( this ) );
		},

		'reconnect' : function () {
			setTimeout( function () {
				connState.acquire();
			}, this.waitInterval );
		},

		'error' : function ( err ) {
			connState.emit( 'error', err );

			connState.release();
			connState.reconnect();
		},

		'release' : function () {
			connState.emit( 'release' );

			this.connection.removeAllListeners();
			this.connection.close();
			this.connection = null;
		}
	} );

	process.on( 'SIGINT', function () {
		if ( this.connection ) {
			connState.release();
		}
	}.bind( this ) );

	this.topology = new Topology( connState );

	this.setupCallbackQueue();
}

KitRPC.prototype.startQueue = function ( queueName, options ) {
	var self  = this;
	var defer = Promise.defer();

	this.topology.getConnection().done( function ( connection ) {

		var channels = {};

		if ( self.topology.getQueue( queueName ) !== undefined ) {
			return defer.resolve( self.topology.getQueue( queueName ) );
		}

		function done () {
			if ( channels.listenChannel && channels.sendChannel ) {
				self.setOptions( queueName, channels, options );
				defer.resolve( self.topology.createQueue( queueName, options ) );
			}
		}

		self.topology.createChannel( connection ).then( function ( channel ) {
			channels.listenChannel = channel;
			done();
		} );

		self.topology.createChannel( connection ).then( function ( channel ) {
			channels.sendChannel = channel;
			done();
		} );

	} );

	return defer.promise;
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

KitRPC.prototype.setupCallbackQueue = function () {
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
			'replyTo'       : options.replyTo || this.replyQueue,
			'mandatory'     : callback ? true : false
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
		this.topology.addSubscription( queueName, callback );
		queue.listen( callback );
	}.bind( this ) );
};

module.exports = KitRPC;
