'use strict';

const config  = require( '../config' );
const request = require( 'request' );
const Promise = require( 'bluebird' );
const Table   = require( 'cli-table' );

function getBasicAuth ( user, pass ) {
	return new Buffer( user + ':' + pass ).toString( 'base64' );
}

function RabbitManagementAPI () {}

RabbitManagementAPI.prototype.getQueues = function () {
	const con = config.connection;

	return new Promise( function ( resolve, reject ) {
		request.get( {
			'uri'     : 'http://' + con.server + ':' + con.portAPI + '/api/queues',
			'headers' : {
				'Authorization' : 'Basic ' + getBasicAuth( con.user, con.pass )
			}
		}, function ( error, load, body ) {
			if ( error ) {
				return reject( error );
			}

			body          = JSON.parse( body );
			this.response = body;
			resolve( this.response );
		} );
	} );
};

RabbitManagementAPI.prototype.drawQueues = function ( done ) {
	let table = new Table( {
		'head'  : [ 'Name', 'State', 'Ready', 'Unacked', 'Total' ],
		'style' : {
			'head' : [ 'cyan' ]
		}
	} );

	let error = 0;

	console.log( 'fetching queues...' );

	this.getQueues()
	.then( function ( responses ) {
		responses.forEach( function ( response ) {
			// jscs:disable
			table.push( [ response.name, response.state, response.messages_ready,
									response.messages_unacknowledged, response.messages ] );
			// jscs:enable

			// if found even one unack or ready
			if ( response.messages > 0 ) {
				error = 1;
			}
		} );

		console.log( table.toString() );
		done( error );
	} )
	.then( null, function () {
		table.push( [ '-', '-', '-', '-', '-' ] );
		console.log( table.toString() );
		done( 1 );
	} );
};

module.exports = new RabbitManagementAPI();
