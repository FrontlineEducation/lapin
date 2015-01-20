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
		'Requester'  : reqRes.Requester,
		'Responder'  : reqRes.Responder,
		'Sender'     : sendRec.Sender,
		'Receiver'   : sendRec.Receiver,
		'Publisher'  : pubSub.Publisher,
		'Subscriber' : pubSub.Subscriber
	};

};
