'use strict';

module.exports = {

	'extract' : function extract ( messageType, callback ) {

		// Split message type to meta
		var tempMeta = messageType.split( '.' );

		// Check if 3 parameters are existing
		if ( tempMeta.length !== 3 ) {
			return callback( new Error( 'Must have proper message type <version>.<resource>.<action>' ) );
		}

		// Transfer to proper meta assignment
		var meta = { };

		meta.version  = tempMeta[ 0 ];
		meta.resource = tempMeta[ 1 ];
		meta.action   = tempMeta[ 2 ];

		callback( null, meta );

	}

};
