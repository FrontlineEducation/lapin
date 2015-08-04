'use strict';

var util          = require( 'util' );
var Rabbus        = require( 'rabbus' );
var mixins        = require( './mixins' );
var validate      = require( './validate' );
var requestStatus = require( './status' );

module.exports = function ReqRes ( reqResOptions ) {

	var cache = {
		'producers' : { },
		'consumers' : { }
	};

	var Rabbit = reqResOptions.rabbit || reqResOptions; // only rabbit

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

		// in the future this should be `fail`
		if ( !message || message === 'undefined' ) {
			return callback( {
				'status'  : 'fail',
				'message' : 'Invalid data'
			}, null );
		}

		this.request( message, function ( response ) {
			var error = null;

			if ( response.status !== 'success' ) {
				error    = response;
				response = null;
			}
			callback( error, response );
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

		// validations
		this.vSchema  = options.validate;
		this.vOptions = options.validateOptions;

	}

	util.inherits( Responder, Rabbus.Responder );

	// Instance Methods
	// ----------------
	Responder.prototype.consume = function ( callback ) {

		var that = this;

		this.handle( function ( message, respond ) {

			var statuses = requestStatus( respond );
			if (  !that.vSchema || that.vSchema === 'undefined' ) {
				// if no validation, invoke callback immediately
				callback( message, statuses );
			} else {

				// perform validation if there is a validation schema
				validate( {
					'value'   : message,
					'schema'  : that.vSchema,
					'options' : that.vOptions
				} )
				.then( function () {

					callback( message, statuses );

				} )
				.catch( function ( error ) {
					// send fail
					respond( {
						'status' : 'fail',
						'data'   : error.message
					} );
				} );
			}

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
