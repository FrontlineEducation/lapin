'use strict';

const util          = require( 'util' );
const Rabbus        = require( 'rabbus' );
const mixins        = require( '../util/mixins' );
const validate      = require( './validate' );
const requestStatus = require( './status' );
const config        = require( '../config' );
const Err           = require( '../util/error' );

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
	const timeout = config.timeout.set( {
		respond, message,
		'log'         : this.logger,
		'emitter'     : this,
		'messageType' : this.messageType
	} );

	const statusOptions = {
		respond, message, timeout,
		'log'         : this.logger,
		'messageType' : this.messageType,
		'emitter'     : this
	};

	const send = requestStatus( statusOptions );

	// perform validation if there is a validation schema
	validate( {
		'value'   : message,
		'schema'  : this.vSchema,
		'options' : this.vOptions
	} )
	.then( function ( data ) {
		callback( data, send );
	} )
	.catch( Err.UnknownSchemaError, () => {
		// backward compatibility for no validation
		callback( message, send );
	} )
	.catch( Err.ValidationError, ( validationErr ) => {
		send.fail( validationErr.message );
		clearTimeout( statusOptions.timeout );
	} )
	.catch( function ( error ) {
		send.error( error.message, error.stack || error );
		clearTimeout( statusOptions.timeout );
	} );
};

Responder.prototype.consume = function ( callback ) {
	this.handle( ( message, respond ) => {
		this.inbound( message, respond, callback );
	} );

	return this;
};

module.exports = Responder;
