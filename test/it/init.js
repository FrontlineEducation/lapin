'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

const _      = require( 'lodash' );
const config = require( process.cwd() + '/test/config' );
const client = require( 'net' );

let rabbit = require( 'wascally' );

// in ms
const timeoutConnection = 3000;

function configure ( options ) {
	let done = options;

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
		const socket = client.createConnection( config.connection.port, config.connection.server );

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
			const error = new Error( 'Failed to connect to the RabbitMQ Server' );

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
