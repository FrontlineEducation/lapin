## Lapin wrapper for [RabbitMQ](http://rabbitmq.com/)

Currently this project is using [Rabbus](https://github.com/derickbailey/rabbus) and [Wascally](https://github.com/LeanKit-Labs/wascally). This project is aiming to support several producer / consumer patterns. The following are is a list of the planned patterns, and the checked ones are currently implemented:

* [X] Send / Receive
* [X] Publish / Subscribe
* [X] Request / Response

The [JSend](http://labs.omniti.com/labs/jsend) specification is required to determine if an error has occurred in a response.

## Installation and Usage

As lapin uses wascally you need to install it along with lapin:

```bash
npm install wascally
npm install lapin
```

Require lapin and wascally:

```javascript
const rabbit = require( 'wascally' );
const lapin  = require( 'lapin' )( rabbit );

// or

const options = {
	logger, rabbit
};

const lapin = require( 'lapin' )( options )
```

The following are simple usage examples:

## Send / Receive

***Sender Options***

	exchange, messageType, routingKey, autoDelete

Please refer to [Rabbus](https://github.com/derickbailey/rabbus) options' info

***Sender***
```javascript
options = 'v1.logs.log';
// or
options = {
    'messageType' : 'v1.logs.log',
    'exchange'    : 'logs'
}
lapin.send( options , message, function ( error, response ) {

	// handling the response is optional
	if ( !error ) {
		console.log( response );
	}

} );
```
Or use the promise style send
```javascript
lapin.sendPromise( 'v1.logs.log', message )
	.then( function ( response ) {
		// Return for chain then and handle response
		console.log( response );

	} )
	.catch( function ( error ) {
		// Handler error
	} );
```

***Receiver Options***

	queue, exchange, messageType, autoDelete, limit, noBatch

***Receiver***
```javascript
options = 'v1.logs.log';
// or
options = {
    'messageType' : 'v1.logs.log',
    'exchange'    : logs
}

lapin.receive( options, function ( message, send ) {

	someDatabaseQuery( message, function ( err, body ) {
		// See # Return Status for send object usage
	} );

} );
```

## Publish / Subscribe

***Publisher Options***

	exchange, messageType, autoDelete

***Publisher***
```javascript
options = 'v1.users.login';
// or
options = {
    'messageType' : 'v1.users.login',
    'exchange'    : 'users' // recommended not to prefix or suffix `exchange` lapin will do it for us
}
lapin.publish( options, message, function ( error, response ) {

		// handling the response is optional
	if ( !error ) {
		console.log( response );
	}

} );
```
***Subscriber Options***

	queue, exchange, messageType, autoDelete, limit, noBatch

***Subscriber***
```
options = 'v1.users.login';
// or
options = {
    'messageType' : 'v1.users.login',
    'queue'       : 'users' // recommended not to put `queue` suffix or prefix, lapin will do it for you
    'exchange'    : 'users'
}
lapin.subscribe( options, function ( message, done ) {

	someDatabaseQuery( message, function ( err, body ) {

		if ( err ) {
			throw err;
		}

		done();

	} );

} );
```

## Request / Response

***Request Options***

	exchange, messageType, autoDelete, routingKey, forceAck

***Requester***
```javascript
options = 'v1.users.findAll'
// or
options = {
    'messageType' : 'v1.users.findAll',
    'exchange'    : 'users'
}
lapin.request( options, message, function ( error, data ) {

	if ( error ) {
		return reply( error ).code( 500 );
	}

	return reply( data.data );
} );
```
Or use the promise style request
```javascript
lapin.requestPromise( 'v1.users.findAll', message )
	.then( function ( data ) {
		// Handle data
		return reply( data.data );

	} )
	.catch( function ( error ) {
		// Handle error
	} );
```

***Responder Options***

	exchange, queue, autoDelete, routingKey, limit, noBatch

***Responder***
```javascript
options = 'v1.users.findAll';
// or
options = {
    'messageType' : 'v1.users.findAll',
    'limit'       : 1
}
lapin.respond( options, function ( message, send ) {
	// See # Return Status for send object usage
} );
```

***Response with Validation using Joi***
```javascript
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

} , function ( message, send ) {
	// See # Return Status for send object usage
} );

```
If validation fails, lapin will bypass respond callback and response a fail status as seen below:
```javascript
    respond( {
        'status' : 'fail',
        'data'   : <Validation error message>
    } );
````
Please refer to [Joi Validation](https://github.com/hapijs/joi) for validation examples, structure and validation options

#### To Consider ####
Make sure to use the same messageType, routingKey and exchange options.
Whenever a `String` option is supplied instead of the `Object` option, lapin will automatically create the ff:
 - exchange and messageType ( Producer )
 - exchange, messageType and queue ( Consumer )

## Return Status
The following consumers returns an object status
* Responder ( Req-Res )
* Receiver ( Send-Rec )

```
lapin.[ respond | receive ] ( message, send ) {

}
```
where `send` is an object of return status
```
send = {
	'success' : {
		returns {
			'status' : success,
			'data'   : data
		},

		'fail' : {
			returns {
				'status' : 'fail',
				'data'   : errorData
		},

		'error' : {
			return {
				'status'  : 'error',
				'message' : errorMsg,
				'data'    : errorData,
				'code'    : errorCode
			}
		}
}
```
### Return Status Usage

```
lapin.[ respond | receive ]( options, function ( message, send ) {

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

Please refer to [JSEND](http://labs.omniti.com/labs/jsend) for standard reply attributes

## Contributing
All pull requests must follow [coding conventions and standards](https://github.com/sinet/coding-conventions).


## Additional Information
#### RPC over RabbitMQ

In general, doing RPC over RabbitMQ is easy. A client sends a request message and a server replies with a response message. In order to receive a response the client needs to send a 'callback' queue address with the request.

![RabbitMQ RPC](rabbitmq_rpc.png)

 * When the client starts up, it creates an exclusive callback queue.
 * For an RPC request, the Client sends a message with two required properties: `reply_to`, which is set to the callback queue and `correlation_id`, which is set to a unique value for every request.
 * The request is sent to an `rpc_queue` queue.
 * The RPC worker (aka: server) is waiting for requests on that queue. When a message appears, it does the job and sends a message with the result back to the Client, using the queue from the `reply_to` field.
 * The client waits for data on the callback queue. When a message appears, it checks the `correlation_id` property. If it matches the value from the request it returns the response to the application.

## Standards/Conventions

* **messageType:** `<version>`.`<resource>`.`<action>`

* **exchange:** `<pattern>`.`<resource>`-exchange

* **queue:** `<pattern>`.<resource>-queue

### Where
`Patterns:`

- req-res

- pub-sub

- send-rec

`Version:`

- v1

- v2

- and so on.
