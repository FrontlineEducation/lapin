'use strict';

var Promise = require( 'bluebird' );
var extend  = require( 'util' )._extend;

var State = require( './state' );

/**
 * Queue class
 *
 * @param {Object} options Queue options
 * See http://www.squaremobius.net/amqp.node/doc/channel_api.html#toc_27 for available options.
 */

function Queue ( options ) {
	options = options || {};

	var queueOptions = {
		'exclusive'   : options.exclusive || false,
		'durable'     : options.ack ? true : false,
		'contentType' : options.contentType || 'application/json'
	};

	queueOptions.autoDelete = !queueOptions.durable;
	queueOptions.persistent = queueOptions.durable;

	this.options       = options;
	this.rpc           = options.rpc;
	this.formatter     = options.formatter;
	this.sendChannel   = options.sendChannel;
	this.listenChannel = options.listenChannel;
	this.queueName     = options.queueName;
	this.queueOptions  = queueOptions;

	var self  = this;

	/**
	 * Queue state manager.
	 * Send and listen operations are delayed until queue becomes ready.
	 */
	var state = new State( {
		'init' : function () {
			this.readyResolve = null;

			this.onReady = new Promise( function ( resolve ) {
				this.readyResolve = resolve;
			}.bind( this ) );

			this.activate();
		},

		'ready' : function () {
			return this.onReady;
		},

		'activate' : function () {
			self.sendChannel.on( 'error', this.close.bind( this ) );
			self.sendChannel.on( 'close', this.close.bind( this ) );
			self.sendChannel.on( 'return', this.return );

			this.readyResolve();
		},

		'close' : function () {
			self.sendChannel.removeAllListeners();

			this.onReady = new Promise( function ( resolve ) {
				this.readyResolve = resolve;
			}.bind( this ) );
		},

		'return' : function ( message ) {
			self.onReturn( message );
		}

	} );

	this.state = state;
	this.state.init();
}

Queue.prototype.onReturn = function ( message ) {
	message.content = {
		'type'    : 'error',
		'message' : 'Unable to route message to ' + message.fields.routingKey + '.'
	};

	this.rpc.callbackHandler( message );
};

Queue.prototype.init = function () {
	var self = this;

	return new Promise( function ( resolve, reject ) {
		console.log( 'Asserting queue ' + self.queueName + '.' );

		self.state.ready().done( function () {
			self.listenChannel.assertQueue( self.queueName, self.queueOptions )
				.then( function () {
					resolve();
				}, function ( err ) {
					reject( err );
				} );
		} );
	} );
};

Queue.prototype.listen = function ( callback ) {
	var self = this;

	console.log( 'Added subscription to ' + self.queueName );

	this.init().then( function () {
		self.listenChannel.consume( self.queueName, function ( message ) {
			if ( message === null ) {
				return;
			}

			function setErrorMessage ( err ) {
				return {
					'message' : err.toString(),
					'type'    : 'error'
				};
			}

			function done ( err, data ) {
				var queue   = message.properties.replyTo;
				var content = data;

				if ( err ) {
					content = setErrorMessage( err );
				}

				self.rpc.send( queue, content, {
					'correlationId' : message.properties.correlationId
				} );
			}

			message.content = self.formatter.deserialize( message.content );

			if ( message.properties.replyTo && message.properties.correlationId ) {
				callback( message, done );
			} else if ( message.properties.correlationId ) {
				callback( message );
			}
		}, {
			'noAck' : !self.queueOptions.persistent
		} );
	} ).catch( function ( err ) {
		console.log( 'Error connecting to queue ' + self.queueName + '. Error: ' + err.toString() );
	} );
};

Queue.prototype.send = function ( message, options ) {
	options = options || {};

	var sendOpts = {};

	this.state.ready().done( function () {

		extend( sendOpts, {
			'replyTo'       : options.replyTo,
			'correlationId' : options.correlationId,
			'mandatory'     : options.mandatory,
			'contentType'   : options.contentType || this.queueOptions.contentType,
			'persistent'    : this.queueOptions.persistent
		} );

		this.sendChannel.sendToQueue(
			this.queueName,
			new Buffer( this.formatter.serialize( message ) ),
			sendOpts
		);

	}.bind( this ) );
};

module.exports = Queue;
