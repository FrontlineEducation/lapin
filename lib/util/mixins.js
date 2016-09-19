'use strict';

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

	getQueueName ( options, prefix ) {
		if ( !options || !options.messageType ) {
			return new Error( 'NULL options' );
		}

		const parts = this.extract( options.messageType );

		if ( parts instanceof Error ) {
			return parts;
		}

		const partQueue = options.queue || parts.action;

		return `${prefix}.${parts.resource}-${partQueue}`;
	},

	getProducerOptions ( options, prefix ) {
		if ( !options || !options.messageType ) {
			return new Error( 'NULL messageType' );
		}

		// returns error if no msgType or if invalid
		const parts = this.extract( options.messageType );

		if ( parts instanceof Error ) {
			return parts;
		}

		const partExchange = options.exchange ||  parts.resource;

		// should we override the exchange and messageType
		return Object.assign( {}, options, {
			'exchange'    : `${prefix}.${partExchange}-exchange`,
			'messageType' : `${prefix}.${options.messageType}`
		} );
	},

	getConsumerOptions ( options, prefix ) {
		// returns error if no msgType or if invalid
		if ( !options || !options.messageType ) {
			throw new Error( 'NULL messageType' );
		}

		const parts = this.extract( options.messageType );

		if ( parts instanceof Error ) {
			return parts;
		}

		// TODO: use passed exchange or queue in the future
		const partQueue    = options.queue || parts.action;
		const partExchange = options.exchange ||  parts.resource;

		return Object.assign( {}, options, {
			'queue'       : `${prefix}.${parts.resource}-${partQueue}`,
			'exchange'    : `${prefix}.${partExchange}-exchange`,
			'messageType' : `${prefix}.${options.messageType}`
		} );
	}
};
