'use strict';

var util          = require( 'util' );
var Rabbus        = require( 'rabbus' );
var mixins        = require( '../util/mixins' );
var validate      = require( './validate' );
var requestStatus = require( './status' );
var config        = require( '../config' );

/*
	Responder
	@params options
		exchange
		queue
		autoDelete
		routingKey
		limit
		noBatch
 */
function Responder ( options ) {

	var Rabbit = config.rabbit;
	var data   = mixins.getConsumerOptions( options, 'req-res' );
	if ( data instanceof Error ) {
		process.nextTick( function () {
			this.emit( 'error', data );
		}.bind( this ) );
	} else {
		Rabbus.Responder.call( this, Rabbit, data );
		// validations
		this.vSchema      = options.validate;
		this.vOptions     = options.validateOptions;
	}
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

	return this;
};

module.exports = Responder;
