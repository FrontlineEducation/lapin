### 5.0.0
- Change `Receiver` parameter from callback to send object

Usage
```
// send is a object with success, fail and error attribs
lapin.receive( function ( message, send ) {
	// can use
	send.success( data );
	// or
	send.fail( error );
	// or
	send.error( error );
} );
```
### 4.7.10
- Refactor responder calls

### 4.7.9
- Pass Joi validated message instead of the original

### 4.7.8
- Fix unacked when timeout occurs

### 4.7.7
- Handle multiple respond calls in one request

### 4.7.6
- Log error messages

### 4.7.5
- Fix for invalid options in lapin

### 4.7.4
- Add timeout handler. Request will timeout after 40s

### 4.7.3
- Fix logging inside rabbit

### 4.7.1, 4.7.2
- Fix options passed in lapin

### 4.7.0
- Add logger support

Usage
```
var rabbit = require( 'wascally' );
var lapin  = require( 'lapin' )( rabbit );

// or

var options = {
    'logger' : logger,
    'rabbit' : wascally
};

var lapin = require( 'lapin' )( options )
```

### 4.6.0
- Fix remove deep clone when transforming wascally/rabbus options.

### 4.5.0
- Support array of messageTypes in Responders
- Emit lapin errors instead of throw

Usage
```
lapin.respond( [ 'v1.resources.action', 'v2.resources.action' ], function ( message, send ) {} );
```

### 4.4.0
- Support other options of rabbus/wascally in Consumer and Producers

Usage

```
options = 'v1.logs.log';
// or
options = {
    'messageType' : 'v1.logs.log',
    'exchange'    : 'logs'
}
lapin.send( options , message, function ( error, data ) {

    // handling the response is optional
    if ( !error ) {
	console.log( response );
    }

} );
```

### 4.3.0
- Remove log to service
- Remove console.log for success replies in Responder
- Incorporate JOI validation to Responder

Usage
```
var rabbit = require( 'wascally' );
var lapin  = require( 'lapin' )( rabbit );

// Responder
lapin.respond( {
    'messageType' : 'v1.users.findAll',
    'validate'    : Joi.object().keys( {
	'username'     : Joi.string().alphanum().min( 3 ).max( 30 ).required(),
	'password'     : Joi.string().regex( /[a-zA-Z0-9]{3,30}/ ),
	'access_token' : [ Joi.string(), Joi.number() ],
	'birthyear'    : Joi.number().integer().min( 1900 ).max( 2013 ),
	'email'        : Joi.string().email()
    } ).with( 'username', 'birthyear' ).without( 'password', 'access_token' ),

    'validateOptions' : {} // <optional> see https://github.com/hapijs/joi for validation options

} , function ( message, respond ) {
    // consumer process
} );
```

### 4.2.1
- Remove error listener possible event leak fix

### 4.2.0
- Add console.log for success replies in Responder

### 4.1.0
- Add console.log for fail and error replies in Responder

### 4.0.1
- Revert to old rabbus ( 0.2.x )

### 4.0.0
- Support JSEND success, error, fail replies in respond( request-respond pattern ). See `Usage`
- Updated to rabbus 0.4.x

Usage
```
// Responder
lapin.respond( 'v1.users.findAll', function ( message, send ) {

    if ( message.invalid ) {
	return send.fail( 'Invalid data' );
    }

    someDatabaseQuery().then( function ( result ) {

	// JSend success with data
	send.success( result );

    } ).catch( function handleError ( error ) {

	// JSend error
	send.error( 'Failed query', error, 500 );
	// or -- code is optional
	send.error( 'Failed query', error );
	// or -- data is optional
	send.error( 'Failed query' );

    } );

} );
```

### 3.2.0
- Added promise request and send functions

Usage
```
lapin.sendPromise( 'v1.logs.log', message )
  .then( function ( response ) {
  } )
  .catch( function ( error ) {
  } );

lapin.requestPromise( 'v1.users.findAll', message )
  .then( function ( data ) {
  } )
  .catch( function ( error ) {
  } );
```

### 3.1.0
- Add logging through a service
- Listen to errors emitted by patterns
- Trap invalid data during request, send and publish

Usage
```
var rabbit       = require( 'wascally' );
var lapinOptions = {
    'rabbit'     : rabbit,
    'logService' : {
	'prefix' : 'v1.logs.logService'
    }
};

var lapin  = require( 'lapin' )( lapinOptions );

// or no logging

var rabbit = require( 'wascally' );
var lapin  = require( 'lapin' )( rabbit );
```

### 3.0.0
- Revert back original lapin invocation. See `Usage` below.

Usage
```
var rabbit = require( 'wascally' );
var lapin  = require( 'lapin' )( rabbit );

lapin.request( 'v1.users.findAll', options, function ( error, response ) {} )

// Response
lapin.respond( 'v1.users.findAll', function ( message, send ) {} )
```

### 2.0.0
- Change expose attributes to lowercase

Usage
```
// Sender
var sender = lapin.sender( { 'messageType' : 'v1.logs.log' } );
sender.produce( message, function ( error, response ) {
} );

// Receiver
var receiver = lapin.receiver( { 'messageType' : 'v1.logs.log' } );
receiver.consume( function ( message, done ) {
} );
```

### 1.0.1
- Fix possible memory leak with the creation of the same messageTypes

### 1.0.0
- Add send-receive pattern
- Add publish-subscribe pattern

Usage
```
// Sender
var sender = new lapin.Sender( { 'messageType' : 'v1.logs.log' } );
sender.produce( message, function ( error, response ) {
} );

// Receiver
var receiver = new lapin.Receiver( { 'messageType' : 'v1.logs.log' } );
receiver.consume( function ( message, done ) {
} );
```

### 0.2.0
- Add request-respond pattern

Usage
```
lapin.request( 'v1.users.findAll', options, function ( error, data ) {} )

// Response
lapin.response( 'v1.users.findAll', function ( options, reply ) {} )
```
