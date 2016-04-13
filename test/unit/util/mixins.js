'use strict';

/* eslint no-unused-expressions:0 */

const expect = require( 'chai' ).expect;
const mixins = require( process.cwd() + '/lib/util/mixins' );

describe( 'mixins', function () {
	it( 'should have the required methods', function ( ) {
		expect( mixins.extract ).to.exist;
		expect( mixins.cloneDeep ).to.exist;
		expect( mixins.transformToObj ).to.exist;
		expect( mixins.getProducerOptions ).to.exist;
		expect( mixins.getConsumerOptions ).to.exist;
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

	it( 'should return null obj when params=null in cloneDeep', function () {
		const obj = mixins.cloneDeep( null );

		expect( obj ).to.not.exists;
	} );

	it( 'should return cloned obj when in cloneDeep', function () {
		const paramObj = { 'name' : 'TestFoo' };
		const obj      = mixins.cloneDeep( paramObj );

		expect( paramObj ).to.not.equal( obj );
	} );
} );
