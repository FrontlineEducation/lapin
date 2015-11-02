'use strict';

// Require bluebird
var _        = require( 'lodash' );
var bluebird = require( 'bluebird' );
var config   = require( './lib/config' ); // sudo global

// Lapin object placeholder
var lapin;

// Load patterns
var ReqRes  = require( './lib/req-res' );
var SendRec = require( './lib/send-rec' );
var PubSub  = require( './lib/pub-sub' );

function Lapin () {

	// Initialize patterns
	var reqRes  = new ReqRes();
	var sendRec = new SendRec();
	var pubSub  = new PubSub();

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

function setConfigs ( options ) {
	/*
	 * setting config for lapin to be used across the lib
	 * options might not only be rabbit
	 */
	config.rabbit = options;
	if ( !options ) {
		config.rabbit = require( 'wascally' );
	} else {
		config.rabbit = require( 'wascally' );
		if ( _.has( options, 'rabbit' ) ) {
			config.rabbit = options.rabbit;
		}

		if ( _.has( options, 'logger' ) ) {
			config.logger = options.logger;
		}
	}

}

module.exports = function ( options ) {
	if ( !lapin ) {
		setConfigs( options );
		lapin = new Lapin( options );
	}
	return lapin;
};

