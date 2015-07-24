'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var expect = require( 'chai' ).expect;
var mixins = require( process.cwd() + '/lib/mixins' );

describe( 'mixins', function () {

	it( 'should have `extract` method', function ( ) {
		expect( mixins.extract ).to.exist;
	} );

	describe( '`extract` method', function () {

		/* eslint-disable no-empty */
		it( 'should throw error on invalid messageType', function (  ) {
			try {
				expect( mixins.extract( 'test.create' ) )
				.to
				.throw( new Error( 'Must have proper message type <version>.<resource>.<action>' ) );
			} catch ( exception ) { }

		} );

		it( 'should return an object on invalid messageType', function (  ) {
			expect( mixins.extract( 'v1.test.create' ) ).to.be.an( 'object' );
			expect( mixins.extract( 'v1.test.create' ).version ).to.exist;
			expect( mixins.extract( 'v1.test.create' ).resource ).to.exist;
			expect( mixins.extract( 'v1.test.create' ).action ).to.exist;
		} );

	} );

} );
