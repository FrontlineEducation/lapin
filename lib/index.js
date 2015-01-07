'use strict';

var KitRPC = require( './kitrpc' );

module.exports.rpc = function rpc ( options ) {
	return new KitRPC( options );
};
