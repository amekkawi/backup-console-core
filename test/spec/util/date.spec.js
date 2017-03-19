'use strict';

const expect = require('expect');
const dateUtil = require('../../../lib/util/date');

describe('util/date', function() {
	it('should export expected methods', function() {
		expect(Object.keys(dateUtil).sort())
			.toEqual([
				'getISOWeekUTC',
				'getISOWeekYearUTC',
			].sort());
	});

	describe('getISOWeekUTC', function() {
		it('util/date.getISOWeekUTC'); // TODO
	});

	describe('getISOWeekYearUTC', function() {
		it('util/date.getISOWeekYearUTC'); // TODO
	});
});
