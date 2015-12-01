'use strict';

// Timeout handler
var TimeoutHandler = require( '../util/timeout' );

module.exports = {
	'rabbit'  : undefined,
	'logger'  : undefined,
	'timeout' : new TimeoutHandler()
};

