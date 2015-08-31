'use strict';

function Producer () {}

Producer.prototype.produce = function ( message, callback ) {
	callback( message );
};

function Consumer () {}

Consumer.prototype.consume = function ( callback ) {
	callback( 'done' );
};

module.exports = {
	'Producer' : Producer,
	'Consumer' : Consumer
};

