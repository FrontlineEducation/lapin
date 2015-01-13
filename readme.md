## Lapin wrapper for [RabbitMQ](http://rabbitmq.com/)

Currently this project is using [Rabbus](https://github.com/derickbailey/rabbus) and [Wascally](https://github.com/LeanKit-Labs/wascally). This project is aiming to support several producer / consumer patterns. The following are is a list of the planned patterns, and the checked ones are currently implemented:

* [ ] Send / Receive
* [ ] Publish / Subscribe
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

The following is simple usage example:

```javascript
// Request
lapin.request( 'users.findAll', options, function ( error, data ) {

	if ( error ) {
		return next( error );
	}

	response.send( 200, data );

	next();
} );

// Response
lapin.response( 'users.findAll', function ( options, reply ) {

	someDatabaseQuery().success( function ( users ) {

		// JSend success with data
		reply( {
			'status' : 'success',
			'data'   : users
		} );

	} ).error( function handleError ( error ) {

		// JSend error
		reply( {
			'status' : 'error',
			'data'   : error
		} );

	} );

} );
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
