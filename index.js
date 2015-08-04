'use strict';

// Require bluebird
var bluebird = require( 'bluebird' );

// Placeholder objects
var lapin;
var rabbit;

// Load patterns
var ReqRes  = require( './lib/req-res' );
var SendRec = require( './lib/send-receive' );
var PubSub  = require( './lib/pub-sub' );

function Lapin ( options ) {

	// Load our on version of wascally if they didn't provide one
	if ( !options ) {
		options = require( 'wascally' );
	}

	// Store the verision of rabbit used
	rabbit = options;

	// Store rabbit if they passed it in as an additional option
	if ( options.rabbit ) {
		rabbit = options.rabbit;
	}

	// Initialize patterns
	var reqRes  = new ReqRes( options );
	var sendRec = new SendRec( options );
	var pubSub  = new PubSub( options );

	// Export interfaces
	return {
		// Expose wascally( rabbit )
		'configure'   : rabbit.configure,
		'connections' : rabbit.connections,
		'rabbit'      : rabbit,

		// Standard interfaces
		'request'   : reqRes.request,
		'respond'   : reqRes.respond,
		'send'      : sendRec.send,
		'receive'   : sendRec.receive,
		'publish'   : pubSub.publish,
		'subscribe' : pubSub.subscribe,

		// Promises
		'requestPromise' : bluebird.promisify( reqRes.request ),
		'sendPromise'    : bluebird.promisify( sendRec.send )

	};

}

module.exports = function ( options ) {
	if ( !lapin ) {
		lapin = new Lapin( options );
	}
	return lapin;
};
