'use strict';

const expect = require('expect');
const promiseUtil = require('../../../lib/util/promise');

describe('util/promise', function() {
	it('should export expected methods', function() {
		expect(Object.keys(promiseUtil).sort())
			.toEqual([
				'PromiseTry',
				'PromiseIterate',
			].sort());
	});

	describe('PromiseTry', function() {
		it('util/promise.PromiseTry'); // TODO
	});

	describe('PromiseIterate', function() {
		it('util/promise.PromiseIterate'); // TODO
	});
});
