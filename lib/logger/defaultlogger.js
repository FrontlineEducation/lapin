'use strict';

let emitter;

const logger = {
	error ( msg, data ) {
		emitter.emit( 'error-log', msg, data );
	},

	warn ( msg, data ) {
		emitter.emit( 'warn-log', msg, data );
	},

	info ( msg, data ) {
		emitter.emit( 'info-log', msg, data );
	},

	verbose ( msg, data ) {
		emitter.emit( 'verbose-log', msg, data );
	},

	debug ( msg, data ) {
		emitter.emit( 'debug-log', msg, data );
	},

	silly ( msg, data ) {
		emitter.emit( 'silly-log', msg, data );
	}
};

module.exports = function ( options ) {
	emitter = options.emitter;
	return logger;
};

