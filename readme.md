## Lapin wrapper for [RabbitMQ](http://rabbitmq.com/)

Currently this project is using [Rabbus](https://github.com/derickbailey/rabbus) and [Wascally](https://github.com/LeanKit-Labs/wascally). This project is aiming to support several producer / consumer patterns. The following are is a list of the planned patterns, and the checked ones are currently implemented:

* [X] Send / Receive
* [X] Publish / Subscribe
* [X] Request / Response

The [JSend](http://labs.omniti.com/labs/jsend) specification is required to determine if an error has occurred in a response.

## Installation an usage

As lapin uses wascally you need to install it along with lapin:

```bash
npm install wascally
npm install lapin
```

Require lapin and wascally:

```javascript
var rabbit = require( 'wascally' );
var lapin  = require( 'lapin' )( rabbit );
```

The following are simple usage examples:

**Send / Receive**

```javascript
// Sender
lapin.send( 'v1.logs.log', message, function ( error, response ) {

	// handling the response is optional
	if ( !error ) {
		console.log( response );
	}

} );

// Receiver
lapin.receive( 'v1.logs.log', function ( message, done ) {

  someDatabaseQuery( message, function ( err, body ) {

    if ( err ) {
      throw err;
    }

    done();

  } );

} );
```

**Publish / Subscribe**

```javascript
// Publisher
lapin.publish( 'v1.users.login', message, function ( error, response ) {

    // handling the response is optional
	if ( !error ) {
		console.log( response );
	}

} );


// Subscriber
lapin.subscribe( 'v1.users.login', function ( message, done ) {

  someDatabaseQuery( message, function ( err, body ) {

    if ( err ) {
      throw err;
    }

    done();

  } );

} );
```

**Request / Response**

```javascript
// Requester
lapin.request( 'v1.users.findAll', message, function ( error, data ) {

	if ( error ) {
		return reply( error ).code( 500 );
	}

	return reply( data.data );
} );

// Responder
lapin.respond( 'v1.users.findAll', function ( message, respond ) {

	someDatabaseQuery().success( function ( result ) {

		// JSend success with data
		respond( {
			'status' : 'success',
			'data'   : result
		} );

	} ).error( function handleError ( error ) {

		// JSend error
		respond( {
			'status' : 'error',
			'data'   : error
		} );

	} );

} );
```

## Attaching Logs
#### Logging through a service
When attaching a logger through a service
```javascript

var rabbit       = require( 'wascally' );
var lapinOptions = {
	'rabbit'     : rabbit,
	'logService' : {
		'prefix' : 'v1.logs.logService'
	}
};

var lapin  = require( 'lapin' )( lapinOptions );
```
Another service listening to `v1.logs.logService` should be receiving the log details sent. Logger thorough a service is using send/receive pattern.

#### Attaching a logger object

 *** under development **

#### No logging
When no logging involved - require lapin this way:
```javascript
var rabbit = require( 'wascally' );
var lapin  = require( 'lapin' )( rabbit );
```


## Contributing
All pull requests must follow [coding conventions and standards](https://github.com/School-Improvement-Network/coding-conventions).


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

###Where
`Patterns:`

- req-res

- pub-sub

- send-rec

`Version:`

- v1

- v2

- and so on.