'use strict';

/**
 * Module dependencies
 */
var extend  = require( 'util' )._extend;
var uuid    = require( 'node-uuid' ).v4;

var Connection = require( './connection' );
var json       = require( './formatter' );

var timeout = global.setTimeout;

function TaskQueue ( channel, options ) {
	this.channel    = channel;
	this.routingKey = options.routingKey;

	var self = this;

	channel.then( function ( ch ) {
		ch.on( 'return', self.onReturn.bind( self ) );
	} );
}

TaskQueue.prototype.onReturn = function ( msg ) {
	var content = {
		'type'  : 'error',
		'error' : 'Unable to route message.'
	};
	this.channel.then( function ( ch ) {
		ch.sendToQueue(
			msg.properties.replyTo,
			new Buffer( json.serialize( content ) ),
			{ 'correlationId' : msg.properties.correlationId }
		);
	} );
};

TaskQueue.prototype.exec = function ( msg, options ) {
	var routingKey = this.routingKey;

	this.channel.then( function ( ch ) {
		ch.sendToQueue(
			routingKey,
			new Buffer( json.serialize( msg ) ),
			options
		);
	} );
};

function WorkerQueue ( channel, options ) {
	this.channel = channel;
	this.options = options;
}

WorkerQueue.prototype.add = function ( source, cb ) {
	var self = this;

	this.channel.then( function ( ch ) {
		self.ch = ch;
		ch.assertQueue( source, self.options ).then( function ( ok ) {
			return ch.consume( ok.queue, function ( msg ) {
				if ( msg !== null ) {
					self.handleMessage( msg, cb );
				}
			}, {
				'noAck' : true,
			} );
		} );
	} );
};

WorkerQueue.prototype.handleMessage = function ( msg, cb ) {
	var ch = this.ch;

	function done( err, data ) {
		var dest    = msg.properties.replyTo;
		var content = data;

		if ( err ) {
			content = {
				'type'  : 'error',
				'error' : err.toString()
			};
		}

		ch.sendToQueue(
			dest,
			new Buffer( json.serialize( content ) ),
			{ 'correlationId' : msg.properties.correlationId }
		);
	}

	msg.content = json.deserialize( msg.content );
	cb( msg, done );
};


/**
 * Main RPC application
 * @param {Object} options RPC options
 */
function KitRPC ( options ) {
	this.options    = options || {};
	this.subscribes = [];
	this.replies    = {};
	this.taskQ      = {};
	this.qOpts      = {
		'exclusive'   : false,
		'durable'     : false,
		'contentType' : 'application/json'
	};

	if ( !options.replyQ ) {
		this.usingDefaultReplyQ = true;
	}

	var self = this;
	var conn = new Connection( options );

	this.connection = conn.connect();
	// Reconnect on error
	conn.on( 'error', function ( err ) {
		console.log( err.toString() );
		timeout( function () {
			self.connection = conn.reconnect();
			// Reset subscriptions and clean queues
			self.setupReplyQ( self.connection.then( function ( c ) {
				return c.createChannel();
			} ) );
			self.taskQ = {};
			self.resubscribe();
		}, options.timeout || 3000);
	} );
	this.setupReplyQ( this.connection.then( function ( c ) {
		return c.createChannel();
	} ) );
}

KitRPC.prototype.setupReplyQ = function ( channel ) {
	var self = this;

	if ( this.usingDefaultReplyQ ) {
		// Rabbitmq will generate a random unique queue when
		// '' is passed in assertQueue.
		self.replyQ = '';
	}

	channel.then( function ( ch ) {
		ch.assertQueue( self.replyQ, {
			'exclusive'  : true,
			'autoDelete' : true
		} ).then( function ( ok ) {
			self.replyQ = ok.queue;
			return ch.consume( ok.queue, function ( msg ) {
				if ( msg !== null ) {
					msg.content = json.deserialize( msg.content );
					self.handleReply( msg );
				}
			}, {
				'noAck'     : true,
				'exclusive' : true
			} );
		} );
	} );
};

KitRPC.prototype.handleReply = function ( msg ) {
	var corrId = msg.properties.correlationId;

	if ( this.replies[ corrId ] ) {
		if ( msg.content.type && msg.content.type === 'error' ) {
			this.replies[ corrId ]( new Error( msg.content.error ) );
		} else {
			this.replies[ corrId ]( null, msg );
		}

		delete this.replies[ corrId ];
	}
};

KitRPC.prototype.exec = function ( queue, msg, opts, cb ) {
	if ( typeof opts === 'function' ) {
		cb   = opts;
		opts = {};
	}

	var taskQ = this.taskQ[ queue ];

	if ( !taskQ ) {
		opts.routingKey = queue;
		taskQ = new TaskQueue( this.connection.then( function ( c ) {
			return c.createChannel();
		} ), extend( opts, this.qOpts ) );
		this.taskQ[ queue ] = taskQ;
	}

	var taskOpts = {
		'correlationId' : opts.correlationId || uuid(),
		'replyTo'       : opts.replyTo || this.replyQ,
		'mandatory'     : true
	};

	this.replies[ taskOpts.correlationId ] = cb;
	taskQ.exec( msg, taskOpts );
};

KitRPC.prototype.add = function ( queue, opts, cb ) {
	if ( typeof opts === 'function' ) {
		cb   = opts;
		opts = {};
	}

	var workQ = new WorkerQueue( this.connection.then( function ( c ) {
		return c.createChannel();
	} ), extend( opts, this.qOpts ) );

	this.subscribes.push( {
		'queue' : queue,
		'opts'  : opts,
		'cb'    : cb
	} );

	workQ.add( queue, cb );
};

KitRPC.prototype.resubscribe = function () {
	var self       = this;
	var subscribes = this.subscribes.slice(0); // copy the array

	this.subscribes = [];
	subscribes.forEach( function ( s ) {
		self.add( s.queue, s.opts, s.cb );
	} );
};

module.exports = KitRPC;
