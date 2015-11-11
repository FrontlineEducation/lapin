'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var _                 = require( 'lodash' );
var rabbit            = require( 'wascally' );
var config            = require( process.cwd() + '/test/config' );
var client            = require( 'net' );
var timeoutConnection = 3000; // in ms

function configure ( options ) {

	var done = options;

	if ( _.has( options, 'done'  ) ) {
		done = options.done;
	}

	if ( _.has( options, 'rabbit' ) ) {
		rabbit = options.rabbit;
	}

	rabbit.configure( {
		'connection' : config.connection
	} )
	.then( function () {

		var socket = client.createConnection( config.connection.port, config.connection.server );
		/*
		in cases host is not reachable and cannot ping
		rabbitmq.on.failed connection cannot catch that scenario
		 */
		socket.setTimeout( timeoutConnection, socket.destroy );

		socket

			.once( 'timeout', function () {
				done( new Error( 'Timeout reached! Failed to connect to the RabbitMQ Server' ) );
			} )
			.once( 'error', function ( error ) {
				socket.destroy();
				done( error );
			} );

		rabbit.connections.default.connection.on( 'failed', function () {
			var error = new Error( 'Failed to connect to the RabbitMQ Server' );
			done( error );
		} );

		rabbit.connections.default.connection.on( 'connected', function () {
			console.log( '--- Connected to RabbitMQ Server ---' );
			socket.destroy();
			done();
		} );
	} )
	.then( null, function ( configureError ) {
		done( configureError );
	} );
}

module.exports = configure;
