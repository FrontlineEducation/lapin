'use strict';

// Load patterns
var ReqRes  = require( './lib/req-res' );
var SendRec = require( './lib/send-receive' );
var PubSub  = require( './lib/pub-sub' );

module.exports = function Lapin ( Rabbit ) {

	// Initialize patterns
	var reqRes  = new ReqRes( Rabbit );
	var sendRec = new SendRec( Rabbit );
	var pubSub  = new PubSub( Rabbit );

	// Export interfaces
	return {
		'request'   : reqRes.request,
		'respond'   : reqRes.respond,
		'send'      : sendRec.send,
		'receive'   : sendRec.receive,
		'publish'   : pubSub.publish,
		'subscribe' : pubSub.subscribe
	};

};
