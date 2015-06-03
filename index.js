'use strict';

// Require bluebird
var bluebird = require( 'bluebird' );

// Lapin object placeholder
var lapin;

// Load patterns
var ReqRes  = require( './lib/req-res' );
var SendRec = require( './lib/send-receive' );
var PubSub  = require( './lib/pub-sub' );

function Lapin ( options ) {

	// Initialize patterns
	var reqRes  = new ReqRes( options );
	var sendRec = new SendRec( options );
	var pubSub  = new PubSub( options );

	// Export interfaces
	return {

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

