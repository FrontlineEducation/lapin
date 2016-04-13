'use strict';

const rabbitapi = require( './rabbitapi' );

rabbitapi.drawQueues( function ( error ) {
	console.error( error );
} );
