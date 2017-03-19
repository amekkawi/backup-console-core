'use strict';

const expect = require('expect');
const inspect = require('object-inspect');
const clientUtil = require('../../../lib/util/client');
const BackupResultIdentifier = require('../../../lib/structs/BackupResultIdentifier');

describe('util/client', function() {
	it('should export expected methods', function() {
		expect(Object.keys(clientUtil).sort())
			.toEqual([
				'parseBackupResultIdentifier',
			].sort());
	});

	describe('parseBackupResultIdentifier', function() {
		it('should return null not a string', function() {
			const values = getValuesWithout().filter((v) => typeof v !== 'string');
			values.forEach(function(value) {
				expect(clientUtil.parseBackupResultIdentifier(value)).toBe(null, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return null if has less than 2 periods', function() {
			[
				'',
				'a',
				'a.b',
			].forEach(function(value) {
				expect(clientUtil.parseBackupResultIdentifier(value)).toBe(null, `Expected %s to be %s for ${inspect(value)}`);
			});
		});

		it('should return an instance of BackupResultIdentifier', function() {
			const identifier = clientUtil.parseBackupResultIdentifier('a.bcd.efg');
			expect(identifier).toBeObjectWithProps(BackupResultIdentifier, {
				original: 'a.bcd.efg',
				backupType: 'a',
				clientId: 'bcd',
				clientKey: 'efg',
			});
		});

		it('should return null if has invalid parts', function() {
			expect(clientUtil.parseBackupResultIdentifier('_.bcd.efg')).toBe(null, `Expected %s to be %s for invalid backupType`);
			expect(clientUtil.parseBackupResultIdentifier('a._.efg')).toBe(null, `Expected %s to be %s for invalid clientId`);
			expect(clientUtil.parseBackupResultIdentifier('a.bcd._')).toBe(null, `Expected %s to be %s for invalid clientKey`);
		});

		it('shoild return check values against validProps, retrning null if they don\'t match', function() {
			expect(clientUtil.parseBackupResultIdentifier(
				'a.bcd.efg',
				{ backupType: 'a' })
			).toBeA(BackupResultIdentifier, `Expected %s to be %s for matched backupType`);

			expect(clientUtil.parseBackupResultIdentifier(
				'a.bcd.efg',
				{ backupType: 'b' })
			).toBe(null, `Expected %s to be %s for mismatch backupType`);

			expect(clientUtil.parseBackupResultIdentifier(
				'a.bcd.efg',
				{ clientId: 'bcd' })
			).toBeA(BackupResultIdentifier, `Expected %s to be %s for matched clientId`);

			expect(clientUtil.parseBackupResultIdentifier(
				'a.bcd.efg',
				{ clientId: 'xyz' })
			).toBe(null, `Expected %s to be %s for mismatch clientId`);

			expect(clientUtil.parseBackupResultIdentifier(
				'a.bcd.efg',
				{ clientKey: 'efg' })
			).toBeA(BackupResultIdentifier, `Expected %s to be %s for matched clientKey`);

			expect(clientUtil.parseBackupResultIdentifier(
				'a.bcd.efg',
				{ clientKey: 'xyz' })
			).toBe(null, `Expected %s to be %s for mismatch clientKey`);
		});
	});
});
