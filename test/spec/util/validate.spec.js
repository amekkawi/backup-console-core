'use strict';

const expect = require('expect');
const inspect = require('object-inspect');
const validateUtil = require('../../../lib/util/validate');

describe('util/validate', function() {
	it('should export expected methods', function() {
		expect(Object.keys(validateUtil).sort())
			.toEqual([
				'backupTypeRegEx',
				'clientIdRegEx',
				'clientKeyRegEx',
				'isValidBackupType',
				'isValidClientId',
				'isValidClientKey',
			].sort());
	});

	it('should export regular expressions', function() {
		expect(validateUtil.backupTypeRegEx).toBeA(RegExp);
		expect(validateUtil.clientIdRegEx).toBeA(RegExp);
		expect(validateUtil.clientKeyRegEx).toBeA(RegExp);
	});

	describe('isValidBackupType', function() {
		it('should return false if not a string', function() {
			const values = getValuesWithout().filter((v) => typeof v !== 'string');
			values.forEach(function(value) {
				expect(validateUtil.isValidBackupType(value)).toBe(false, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return true for valid values', function() {
			[
				'a',
				'az',
				'a_z',
				'a-z',
				'a0',
				'a_0',
				'a-0',
				'abcdefghij',
				'a--------0',
			].forEach(function(value) {
				expect(validateUtil.isValidBackupType(value)).toBe(true, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return false for invalid values', function() {
			[
				'',
				' ',
				'_',
				'-',
				'A',
				'aZ',
				'AZ',
				'0',
				'-',
				'_',
				'0z',
				'_0z',
				'0z_',
				'0_z',
				'0-z',
				'-0z',
				'0z-',
				'00',
				'0_0',
				'0-0',
				'abcdefghijh',
			].forEach(function(value) {
				expect(validateUtil.isValidBackupType(value)).toBe(false, `Expected %s to be %s for ${inspect(value)}`);
			});
		});
	});

	describe('isValidClientId', function() {
		it('should return false if not a string', function() {
			const values = getValuesWithout().filter((v) => typeof v !== 'string');
			values.forEach(function(value) {
				expect(validateUtil.isValidClientId(value)).toBe(false, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return true for valid values', function() {
			[
				'012',
				'ABC',
				'abc',
				'a_-z',
				'abcdefghijklmnopqrst0123456789ABCDEFGHIJKLMNOPQRST',
			].forEach(function(value) {
				expect(validateUtil.isValidClientId(value)).toBe(true, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return false for invalid values', function() {
			[
				'',
				' ',
				'_',
				'-',
				'A',
				'A+C',
				'A=C',
				'A+C',
				'aZ',
				'AZ',
				'00',
				'--',
				'__',
				'-AB',
				'AB-',
				'_AB',
				'AB_',
				'abcdefghijklmnopqrst_0123456789ABCDEFGHIJKLMNOPQRST',
			].forEach(function(value) {
				expect(validateUtil.isValidClientId(value)).toBe(false, `Expected %s to be %s for ${inspect(value)}`);
			});
		});
	});

	describe('isValidClientKey', function() {
		it('should return false if not a string', function() {
			const values = getValuesWithout().filter((v) => typeof v !== 'string');
			values.forEach(function(value) {
				expect(validateUtil.isValidClientKey(value)).toBe(false, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return true for valid values', function() {
			[
				'012',
				'ABC',
				'abc',
				'a0z',
				'abcdefghijklmnopqrst0123456789ABCDEFGHIJKLMNOPQRST',
			].forEach(function(value) {
				expect(validateUtil.isValidClientKey(value)).toBe(true, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return false for invalid values', function() {
			[
				'',
				' ',
				'_',
				'-',
				'A',
				'a+c',
				'A=C',
				'A+C',
				'aZ',
				'AZ',
				'00',
				'--',
				'__',
				'-AB',
				'AB-',
				'_AB',
				'AB_',
				'Zabcdefghijklmnopqrst0123456789ABCDEFGHIJKLMNOPQRST',
			].forEach(function(value) {
				expect(validateUtil.isValidClientKey(value)).toBe(false, `Expected %s to be %s for ${inspect(value)}`);
			});
		});
	});
});
