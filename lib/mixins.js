'use strict';

var _ = require( 'lodash' );

function extract ( messageType ) {
	// Transfer to proper meta assignment
	var meta = { };

	// Split message type to meta
	var tempMeta = messageType.split( '.' );

	// Check if 3 parameters are existing
	if ( tempMeta.length !== 3 ) {
		throw new Error( 'Must have proper message type <version>.<resource>.<action>' );
	}

	meta.version  = tempMeta[ 0 ];
	meta.resource = tempMeta[ 1 ];
	meta.action   = tempMeta[ 2 ];

	return meta;
}

module.exports = {

	'extract' : extract,

	// for string param messageType
	'transformToObj' : function transformToObj ( options ) {
		if ( typeof options === 'string' ) {
			options = {
				'messageType' : options
			};
		}
		return options;
	},

	'getProducerOptions' : function getConsumerOptions ( options, prefix ) {

		// throws error if no msgType or if invalid
		var parts = extract( options.messageType );

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

		return _.extend( transformedOptions, options );
	},

	'getConsumerOptions' : function getProducerOptions ( options, prefix ) {

		// throws error if no msgType or if invalid
		var parts = extract( options.messageType );

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

		return _.extend( transformedOptions, options );
	}

};
