'use strict';

const _ = require( 'lodash' );

module.exports = {
	cloneDeep ( obj ) {
		if ( obj && typeof obj === 'object' ) {
			obj = JSON.parse( JSON.stringify( obj ) );
		}
		return obj;
	},

	extract ( messageType ) {
		// Transfer to proper meta assignment
		let meta       = { };
		let returnData = meta;
		// Split message type to meta
		const tempMeta = messageType.split( '.' );

		// Check if 3 parameters are existing
		if ( tempMeta.length !== 3 ) {
			returnData = new Error( 'Must have proper message type <version>.<resource>.<action>' );
		} else {
			meta.version  = tempMeta[ 0 ];
			meta.resource = tempMeta[ 1 ];
			meta.action   = tempMeta[ 2 ];
			returnData    = meta;
		}
		return returnData;
	},

	// for string param messageType
	transformToObj ( options ) {
		if ( typeof options === 'string' ) {
			options = {
				'messageType' : options
			};
		} else if ( options instanceof Array ) {
			return new Error( 'Options must be a string or a config object' );
		}

		return options;
	},

	getProducerOptions ( options, prefix ) {
		if ( !options || !options.messageType ) {
			return new Error( 'NULL messageType' );
		}

		// returns error if no msgType or if invalid
		const parts = this.extract( options.messageType );
		let returnData;

		if ( parts instanceof Error ) {
			returnData = parts;
		} else {
			// if no exchange, create exchange from msgType
			const partExchange = options.exchange ||  parts.resource;
			const exchange     = prefix + '.' + partExchange + '-exchange';

			// should we override the exchange and messageType
			const transformedOptions = {
				exchange,
				'messageType' : prefix + '.' + options.messageType
			};

			// strip off to persists transformed options
			options = _.omit( options, 'messageType', 'exchange' );

			returnData = _.extend( transformedOptions, options );
		}
		return returnData;
	},

	getConsumerOptions ( options, prefix ) {
		// returns error if no msgType or if invalid

		if ( !options || !options.messageType ) {
			throw new Error( 'NULL messageType' );
		}

		const parts = this.extract( options.messageType );
		let returnData;

		if ( parts instanceof Error ) {
			returnData = parts;
		} else {
			// if no exchange, create exchange from msgType
			const partExchange = options.exchange ||  parts.resource;
			const exchange     = prefix + '.' + partExchange + '-exchange';

			// if no queue, create queue from msgType
			const partQueue = options.queue || parts.action;
			const queue     = prefix + '.' + parts.resource + '-' + partQueue;

			// should we override the exchange and messageType
			const transformedOptions = {
				queue,
				exchange,
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
