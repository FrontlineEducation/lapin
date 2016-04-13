'use strict';

// Timeout handler
const TimeoutHandler = require( '../util/timeout' );

module.exports = {
	'rabbit'  : undefined,
	'logger'  : undefined,
	'timeout' : new TimeoutHandler()
};

