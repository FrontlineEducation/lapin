'use strict';

// Load patterns
var ReqRes      = require( './lib/req-res' );
var SendReceive = require( './lib/send-receive' );

module.exports = function Lapin ( Rabbit ) {

	// Initialize patterns
	var reqres      =  new ReqRes( Rabbit );
	var sendreceive =  new SendReceive( Rabbit );

	// Export interfaces
	return {
		'request'  : reqres.request,
		'response' : reqres.response,
		'send'     : sendreceive.send,
		'receive'  : sendreceive.receive
	};

};
