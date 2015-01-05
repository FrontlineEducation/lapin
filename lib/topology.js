'use strict';

var Promise = require( 'bluebird' );
var _       = require( 'lodash' );
var Queue   = require( './queue' );

function Topology ( resource ) {

	this.channels      = [];
	this.subscriptions = {};
	this.queues        = {};

	resource.on( 'connected', function ( conn ) {
		this.connection = conn;
		this.connResolve( conn );

		if ( this._lastError ) {
			this.recreateChannels();
		}
	}.bind( this ) );

	resource.on( 'release', function () {
		this.destroy();
		this.resetConnectionStatus();
	}.bind( this ) );

	resource.on( 'error', function ( err ) {
		this._lastError = err;
	}.bind( this ) );

	this.resetConnectionStatus();
}

Topology.prototype.resetConnectionStatus = function () {
	this.init = new Promise( function ( resolve ) {
		this.connResolve = resolve;
	}.bind( this ) );
};

Topology.prototype.recreateChannels = function () {
	var self = this;

	_.each( this.queues, function ( queue ) {
		var channels = {};

		function done () {
			if ( channels.listenChannel && channels.sendChannel ) {
				queue.sendChannel   = channels.sendChannel;
				queue.listenChannel = channels.listenChannel;

				queue.state.activate();

				if ( self.subscriptions[ queue.queueName ] ) {
					self.subscriptions[ queue.queueName ].handlers.forEach( function ( handler ) {
						queue.listen( handler );
					} );
				}
			}
		}

		self.createChannel( self.connection ).then( function ( channel ) {
			channels.listenChannel = channel;
			done();
		} );

		self.createChannel( self.connection ).then( function ( channel ) {
			channels.sendChannel = channel;
			done();
		} );
	} );
};

Topology.prototype.getConnection = function () {
	return this.init;
};

Topology.prototype.createQueue = function ( queueName, options ) {
	this.queues[ queueName ] = new Queue( options );
	return this.queues[ queueName ];
};

Topology.prototype.getQueue = function ( queueName ) {
	return this.queues[ queueName ];
};

Topology.prototype.createChannel = function ( connection ) {
	return new Promise( function ( resolve, reject ) {
		connection.createChannel().then( function ( channel ) {
			this.channels.push( channel );
			resolve( channel );
		}.bind( this ) );
	}.bind( this ) );
};

Topology.prototype.addSubscription = function ( queueName, handler ) {
	if ( !this.subscriptions[ queueName ] ) {
		this.subscriptions[ queueName ] = {
			'handlers' : []
		};
	}

	this.subscriptions[ queueName ].handlers.push( handler );
};

Topology.prototype.destroy = function () {
	this.channels.forEach( function ( channel ) {
		channel.close();
	} );

	this.channels = [];
};

module.exports = Topology;
