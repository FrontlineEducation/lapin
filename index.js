'use strict';

// Require bluebird
const _        = require( 'lodash' );
const bluebird = require( 'bluebird' );

// sudo global
const config = require( './lib/config' );

// Lapin object placeholder
let lapin;

// Load patterns
const ReqRes  = require( './lib/req-res' );
const SendRec = require( './lib/send-rec' );
const PubSub  = require( './lib/pub-sub' );

function Lapin () {
	// Initialize patterns
	const reqRes  = new ReqRes();
	const sendRec = new SendRec();
	const pubSub  = new PubSub();

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

// pick only the needed options
function hasMultipleOptions ( options ) {
	if ( _.has( options, 'rabbit' ) ) {
		return true;
	}

	if ( _.has( options, 'logger' ) ) {
		return true;
	}

	if ( _.has( options, 'timeout' ) ) {
		return true;
	}

	return false;
}

function setConfigs ( options ) {
	/*
	 * setting config for lapin to be used across the lib
	 * options might not only be rabbit
	 */
	config.rabbit  = options;
	config.timeout.setOptions( options.timeout );
	if ( hasMultipleOptions( options ) ) {
		config.rabbit = options.rabbit;
		config.logger = options.logger;
	}

	if ( !options || !config.rabbit  ) {
		// should throw error and not proceed to object creation
		throw new Error( 'Rabbit required' );
	}
}

module.exports = function ( options ) {
	if ( !lapin ) {
		setConfigs( options );
		lapin = new Lapin( options );
	}
	return lapin;
};

