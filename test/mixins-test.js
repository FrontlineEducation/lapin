'use strict';

var Code  = require( 'code' );
var Lab   = require( 'lab' );

var lab      = exports.lab = Lab.script();
var describe = lab.describe;
var it       = lab.it;
var expect   = Code.expect;

var mixins = require( '../lib/mixins' );

describe( 'mixins', function () {

	it( 'should have `extract` method', function ( done ) {
		expect( mixins.extract ).to.exist();
		done();
	} );

	describe( 'mixins `extract` method', function () {

		it( 'should throw error on invalid messageType', function ( done ) {
			try {
				Code.expect( mixins.extract( 'test.create' ) )
				.to
				.throw( Error, 'Must have proper message type <version>.<resource>.<action>' );
			} catch ( exception ) { }

			done();
		} );

		it( 'should return an object on invalid messageType', function ( done ) {
			expect( mixins.extract( 'v1.test.create' ) ).to.be.an.object();
			expect( mixins.extract( 'v1.test.create' ).version ).to.exist();
			expect( mixins.extract( 'v1.test.create' ).resource ).to.exist();
			expect( mixins.extract( 'v1.test.create' ).action ).to.exist();
			done();
		} );

	} );

} );
