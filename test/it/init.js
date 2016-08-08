'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

const _      = require( 'lodash' );
const config = require( process.cwd() + '/test/config' );
const client = require( 'net' );

let rabbit = require( 'rabbot' );

// in ms
const timeoutConnection = 4000;

function configure ( options ) {
	let done = options;

	if ( _.has( options, 'done'  ) ) {
		done = options.done;
	}

	if ( _.has( options, 'rabbit' ) ) {
		rabbit = options.rabbit;
	}

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

	let connection = _.defaults( config.connection, {
		'publishTimeout' : 40000,
		'replyTimeout'   : 45000
	} );

	rabbit.configure( {
		connection
	} )
	.then( function () {
		console.log( '--- Connected to RabbitMQ Server ---' );
		socket.destroy();
		done();
	} )
	.catch( ()  => {
		done( new Error( 'Failed to connect to the RabbitMQ Server' ) );
	} );
}

module.exports = configure;
