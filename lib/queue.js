'use strict';

var Promise = require( 'bluebird' );
var extend  = require( 'util' )._extend;

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

	this.rpc            = options.rpc;
	this.formatter      = options.formatter;
	this.sendChannel    = options.sendChannel;
	this.listenChannel  = options.listenChannel;
	this.queueName      = options.queueName;
	this.queueOptions   = queueOptions;

	var self = this;

	this.init = Promise.all( [

		new Promise( function ( resolve, reject ) {
			console.log( 'Asserting queue ' + self.queueName + '.' );
			self.listenChannel.assertQueue( self.queueName, queueOptions ).then( function () {
				resolve();
			} );
		} )

	] ).catch( function ( err ) {
		console.log( 'Error connecting to queue ' + self.queueName + '. Error: ' + err.toString() );
	} );
}

Queue.prototype.listen = function ( callback ) {
	var self = this;

	console.log( 'Started listening to queue ' + self.queueName );

	this.init.done( function () {
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
	} );
};

Queue.prototype.send = function ( message, options ) {
	options = options || {};

	var sendOpts = {};

	extend( sendOpts, {
		'replyTo'       : options.replyTo,
		'correlationId' : options.correlationId,
		'contentType'   : options.contentType || this.queueOptions.contentType,
		'persistent'    : this.queueOptions.persistent
	} );

	this.init.done( function () {
		this.sendChannel.sendToQueue(
			this.queueName,
			new Buffer( this.formatter.serialize( message ) ),
			sendOpts
		);
	}.bind( this ) );
};

module.exports = Queue;
