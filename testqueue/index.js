'use strict';

var rabbitapi = require( './rabbitapi' );

rabbitapi.drawQueues( function ( error ) {
	console.error( error );
} );
