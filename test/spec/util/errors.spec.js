'use strict';

const expect = require('expect');
const errorsUtil = require('../../../lib/util/errors');

describe('util/errors', function() {
	it('should export expected methods', function() {
		expect(Object.keys(errorsUtil).sort())
			.toEqual([
				'AppError',
				'InvalidClientError',
				'InvalidBackupPayloadError',
				'PayloadExtractError',
			].sort());
	});

	describe('AppError', function() {
		it('util/errors.AppError'); // TODO
	});

	describe('InvalidClientError', function() {
		it('util/errors.InvalidClientError'); // TODO
	});

	describe('InvalidBackupPayloadError', function() {
		it('util/errors.InvalidBackupPayloadError'); // TODO
	});

	describe('PayloadExtractError', function() {
		it('util/errors.PayloadExtractError'); // TODO
	});
});
