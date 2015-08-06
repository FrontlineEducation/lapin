'use strict';

module.exports = function ( respond ) {

	return {
		'success' : function ( data ) {
			respond( {
				'status' : 'success',
				'data'   : data
			} );
		},

		'error' : function ( data, errorData, code ) {
			console.log( 'Error:', data, errorData, code );

			respond( {
				'status'  : 'error',
				'message' : data, // interchanged because data is optional
				'data'    : errorData || {}, // optional
				'code'    : code || 500 // optional
			} );

		},

		'fail' : function ( data ) {
			console.log( 'Fail:', data );

			respond( {
				'status' : 'fail',
				'data'   : data
			} );
		}
	};
};
