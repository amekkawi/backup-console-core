'use strict';

const expect = require('expect');
const loggingUtil = require('../../../lib/util/logging');

describe('util/logging', function() {
	it('should export expected methods', function() {
		expect(Object.keys(loggingUtil).sort())
			.toEqual([
				'LEVELS',
				'LEVEL_TO_NAME',
				'safeObjClone',
				'getCaller3Info',
				'makeLogRecord',
				'formatLogRecord',
			].sort());
	});

	describe('LEVELS', function() {
		it('util/logging.LEVELS'); // TODO
	});

	describe('LEVEL_TO_NAME', function() {
		it('util/logging.LEVEL_TO_NAME'); // TODO
	});

	describe('safeObjClone', function() {
		it('util/logging.safeObjClone'); // TODO
	});

	describe('getCaller3Info', function() {
		it('util/logging.getCaller3Info'); // TODO
	});

	describe('makeLogRecord', function() {
		it('util/logging.makeLogRecord'); // TODO
	});

	describe('formatLogRecord', function() {
		it('util/logging.formatLogRecord'); // TODO
	});
});
