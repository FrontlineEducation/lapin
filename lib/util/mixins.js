'use strict';

var _ = require( 'lodash' );

module.exports = {

	'extract' : function extract ( messageType ) {
		// Transfer to proper meta assignment
		var meta       = { };
		var returnData = meta;
		// Split message type to meta
		var tempMeta = messageType.split( '.' );

		// Check if 3 parameters are existing
		if ( tempMeta.length !== 3 ) {
			returnData = new Error( 'Must have proper message type <version>.<resource>.<action>' );
		} else {
			meta.version  = tempMeta[ 0 ];
			meta.resource = tempMeta[ 1 ];
			meta.action   = tempMeta[ 2 ];
			returnData = meta;
		}
		return returnData;
	},

	// for string param messageType
	'transformToObj' : function transformToObj ( options ) {
		if ( typeof options === 'string' ) {
			options = {
				'messageType' : options
			};
		} else if ( options instanceof Array ) {
			return new Error( 'Options must be a string or a config object' );
		}

		return options;
	},

	'getProducerOptions' : function getConsumerOptions ( options, prefix ) {

		// returns error if no msgType or if invalid
		var parts = this.extract( options.messageType );
		var returnData;
		if ( parts instanceof Error ) {
			returnData = parts;
		} else {
			// if no exchange, create exchange from msgType
			var partExchange = options.exchange ||  parts.resource;
			var exchange     = prefix + '.' + partExchange + '-exchange';

			// should we override the exchange and messageType
			var transformedOptions = {
				'exchange'    : exchange,
				'messageType' : prefix + '.' + options.messageType
			};

			// strip off to persists transformed options
			options = _.omit( options, 'messageType', 'exchange' );

			returnData = _.extend( transformedOptions, options );
		}
		return returnData;
	},

	'getConsumerOptions' : function getProducerOptions ( options, prefix ) {
		// returns error if no msgType or if invalid
		var parts = this.extract( options.messageType );
		var returnData;

		if ( parts instanceof Error ) {
			returnData = parts;
		} else {
			// if no exchange, create exchange from msgType
			var partExchange = options.exchange ||  parts.resource;
			var exchange     = prefix + '.' + partExchange + '-exchange';

			// if no queue, create queue from msgType
			var partQueue = options.queue || parts.resource;
			var queue     = prefix + '.' + partQueue + '-queue';

			// should we override the exchange and messageType
			var transformedOptions = {
				'queue'       : queue,
				'exchange'    : exchange,
				'messageType' : prefix + '.' + options.messageType
			};

			// strip off to persists transformed options
			options = _.omit( options,
								'messageType', 'exchange', 'queue', 'validate', 'validateOptions' );

			returnData = _.extend( transformedOptions, options );
		}
		return returnData;
	}

};
