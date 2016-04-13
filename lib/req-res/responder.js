'use strict';

const util          = require( 'util' );
const Rabbus        = require( 'rabbus' );
const mixins        = require( '../util/mixins' );
const validate      = require( './validate' );
const requestStatus = require( './status' );
const config        = require( '../config' );

let logger = require( '../logger' );

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
	const data = mixins.getConsumerOptions( options, 'req-res' );

	if ( data instanceof Error ) {
		throw data;
	}

	Rabbus.Responder.call( this, config.rabbit, data );
	// validations
	this.vSchema      = options.validate;
	this.vOptions     = options.validateOptions;

	this.logger = logger( { 'emitter' : this } );
}

util.inherits( Responder, Rabbus.Responder );

// Instance Methods
// ----------------
Responder.prototype.inbound = function ( message, respond, callback ) {
	const statusOptions = {
		respond,
		message,
		'log'         : this.logger,
		'messageType' : this.messageType,
		'emitter'     : this
	};

	if ( !this.vSchema || this.vSchema === 'undefined' ) {
		// if no validation, invoke callback immediately
		callback( message, requestStatus( statusOptions ) );
	} else {
		// perform validation if there is a validation schema
		validate( {
			'value'   : message,
			'schema'  : this.vSchema,
			'options' : this.vOptions
		} )
		.then( function ( data ) {
			callback( data, requestStatus( statusOptions ) );
		} )
		.catch( function ( error ) {
			// send fail
			respond( {
				'status' : 'fail',
				'data'   : error.message
			} );
		} );
	}
};

Responder.prototype.consume = function ( callback ) {
	const that = this;

	this.handle( function ( message, respond ) {
		that.inbound( message, respond, callback );
	} );

	return this;
};

module.exports = Responder;
