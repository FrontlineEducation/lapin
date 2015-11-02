'use strict';

var emitter;

var logger = {
	'error' : function ( msg, data ) {
		emitter.emit( 'error-log', msg, data );
	},

	'warn' : function ( msg, data ) {
		emitter.emit( 'warn-log', msg, data );
	},

	'info' : function ( msg, data ) {
		emitter.emit( 'info-log', msg, data );
	},

	'verbose' : function ( msg, data ) {
		emitter.emit( 'verbose-log', msg, data );
	},

	'debug' : function ( msg, data ) {
		emitter.emit( 'debug-log', msg, data );
	},

	'silly' : function ( msg, data ) {
		emitter.emit( 'silly-log', msg, data );
	}
};

module.exports = function ( options ) {
	emitter = options.emitter;
	return logger;
};

