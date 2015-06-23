'use strict';

var util   = require( 'util' );
var Rabbus = require( 'rabbus' );
var mixins = require( './mixins' );
var Log    = require( './log' );

function onErrorEmit ( rabbit, log, callback ) {
	var listener = function ( reqresError ) {
		callback( {
			'status'  : 'error',
			'message' : 'Request error',
			'data'    : reqresError
		}, null );

		log.error( {
			'msg'  : rabbit.messageType,
			'data' : reqresError
		} );
	};

	rabbit.once( 'error', listener );
	return listener;
}

module.exports = function ReqRes ( reqResOptions ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	var Rabbit = reqResOptions.rabbit || reqResOptions; // only rabbit
	var log    = new Log( reqResOptions );

	// Requester
	// --------
	function Requester ( options ) {

		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		var exchange    = 'req-res.' + parts.resource + '-exchange';
		var messageType = 'req-res.' + this.messageType;

		Rabbus.Requester.call( this, Rabbit, {
			'exchange'    : exchange,
			'messageType' : messageType
		} );

	}

	util.inherits( Requester, Rabbus.Requester );

	// Instance Methods
	// ----------------
	Requester.prototype.produce = function ( message, callback ) {

		if ( !message || message === 'undefined' ) {
			return callback( {
				'status'  : 'error',
				'message' : 'Invalid data.'
			}, null );
		}

		var listener = onErrorEmit( this, log, callback ); // Listen to error emitted

		log.info( {
			'msg'  : this.messageType,
			'data' : message
		} );

		this.request( message, function ( response ) {
			var error = null;

			if ( response.status !== 'success' ) {
				error    = response;
				response = null;

				log.error( {
					'msg'  : this.messageType,
					'data' : error
				} );
			}

			callback( error, response );

			// remove error listener
			this.removeListener( 'error', listener );
		}.bind( this ) );

		return this;
	};

	function getRequesterAndProduce ( options, message, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.producers[ options.messageType ] ) {
			cache.producers[ options.messageType ] = new Requester( options );
		}
		return cache.producers[ options.messageType ].produce( message, callback );
	}

	// Responder
	// ---------
	function Responder ( options ) {
		this.messageType = options.messageType;
		var parts        = mixins.extract( this.messageType );

		Rabbus.Responder.call( this, Rabbit, {
			'exchange'    : 'req-res.' + parts.resource + '-exchange',
			'queue'       : 'req-res.' + parts.resource + '-queue',
			'messageType' : 'req-res.' + this.messageType
		} );
	}

	util.inherits( Responder, Rabbus.Responder );

	// Instance Methods
	// ----------------
	Responder.prototype.consume = function ( callback ) {

		log.info( {
			'msg'  : this.messageType,
			'data' : {}
		} );

		this.handle( function ( message, respond ) {

			var statuses = {
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
						'code'    : code || 0 // optional
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

			callback( message, statuses );

		} );

		/*
		* TODO: Log nack or error emitted
		* We can't call callback and pass error msg because
		* we don't have the reply(). reply() is only available when message
		* is properly ack.
		*/

		return this;
	};

	function getResponderAndConsume ( options, callback ) {
		// cater a string option
		options = mixins.transformToObj( options );

		if ( !cache.consumers[ options.messageType ] ) {
			cache.consumers[ options.messageType ] = new Responder( options );
		}
		return cache.consumers[ options.messageType ].consume( callback );
	}

	return {
		'request' : getRequesterAndProduce,
		'respond' : getResponderAndConsume
	};

};
