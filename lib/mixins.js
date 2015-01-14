'use strict';

module.exports = {

	'extract' : function extract ( messageType ) {

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
};
