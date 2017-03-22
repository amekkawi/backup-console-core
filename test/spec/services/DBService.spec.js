'use strict';

const expect = require('expect');
const Service = require('../../../lib/Service');
const DBService = require('../../../lib/services/DBService');
const BackupResultMetrics = require('../../../lib/structs/BackupResultMetrics');

describe('DBService', function() {
	it('should extend from Service', function() {
		expect(DBService.prototype).toBeA(Service, 'Expected DBService %s to extend from %s');
	});

	[
		'addClient',
		'getClient',
		'getBackupResult',
		'addBackupResult',
		'incrementBackupResultMetrics',
		'getClientMonthlyMetrics',
		'getClientWeeklyMetrics',
	]
		.forEach(function(methodName) {
			describe(`DBService#${methodName}`, function() {
				it('should return a rejected promise', function() {
					const service = new DBService({});

					const promise = service[methodName]();
					expect(promise).toBeA(Promise);

					return promise.then(function() {
						throw new Error(`Expected DBService#${methodName} to not resolve`);
					}, function(err) {
						expect(err).toBeA(Error);
						expect(err.message).toBe(`DBService#${methodName} not implemented`);
					});
				});
			});
		});

	describe('DBService#verifyClient', function() {
		it('should call DBService#getClient', function() {
			const expectedError = new Error();
			const service = new DBService({});
			expect.spyOn(service, 'getClient')
				.andReturn(Promise.reject(expectedError));

			const promise = service.verifyClient('client-id', 'client-key');
			expect(promise).toBeA(Promise);

			return promise.then(function() {
				throw new Error('Expected to not resolve');
			}, function(err) {
				expect(err).toBe(expectedError);
			});
		});

		it('should return "NOT_FOUND" if client doesn\'t exist', function() {
			const service = new DBService({});
			const getClientSpy = expect.spyOn(service, 'getClient')
				.andReturn(Promise.resolve(null));

			const promise = service.verifyClient('client-id', 'client-key');
			expect(promise).toBeA(Promise);

			return promise.then(function(result) {
				expect(getClientSpy.calls.length).toBe(1);
				expect(getClientSpy.calls[0].arguments.length).toBe(2);
				expect(getClientSpy.calls[0].arguments[0]).toBe('client-id');
				expect(getClientSpy.calls[0].arguments[1]).toBeA('object');
				expect(getClientSpy.calls[0].arguments[1].attributes).toBeA('array');
				expect(getClientSpy.calls[0].arguments[1].attributes).toEqual(['clientId', 'clientKey']);
				expect(result).toBe('NOT_FOUND');
			});
		});

		it('should return "MATCH" if client exists and key matches', function() {
			const service = new DBService({});
			const getClientSpy = expect.spyOn(service, 'getClient')
				.andReturn(Promise.resolve({
					clientId: 'client-id',
					clientKey: 'client-key',
				}));

			const promise = service.verifyClient('client-id', 'client-key');
			expect(promise).toBeA(Promise);

			return promise.then(function(result) {
				expect(getClientSpy.calls.length).toBe(1);
				expect(result).toBe('MATCH');
			});
		});

		it('should return "KEY_MISMATCH" if client exists and key doesn\'t matches', function() {
			const service = new DBService({});
			const getClientSpy = expect.spyOn(service, 'getClient')
				.andReturn(Promise.resolve({
					clientId: 'client-id',
					clientKey: 'NOT-client-key',
				}));

			const promise = service.verifyClient('client-id', 'client-key');
			expect(promise).toBeA(Promise);

			return promise.then(function(result) {
				expect(getClientSpy.calls.length).toBe(1);
				expect(result).toBe('KEY_MISMATCH');
			});
		});
	});

	describe('DBService#aggregateBackupResultMetrics', function() {
		it('should return an object with expected props', function() {
			const service = new DBService({});
			const ret = service.aggregateBackupResultMetrics([]);

			expect(ret).toBeA('object');
			expect(Object.keys(ret).sort()).toEqual([
				'byClient',
				'byYearWeek',
				'byYearMonth',
			].sort());

			expect(ret.byClient).toBeA('object');
			expect(Object.keys(ret.byClient).sort()).toEqual([
				'backupCount',
				'totalBytes',
				'totalItems',
				'errorCount',
			].sort());
			expect(ret.byClient.backupCount).toBe(0);
			expect(ret.byClient.totalBytes).toBe(0);
			expect(ret.byClient.totalItems).toBe(0);
			expect(ret.byClient.errorCount).toBe(0);

			expect(ret.byYearMonth).toBeA('object');
			expect(Object.keys(ret.byYearMonth).length).toBe(0);

			expect(ret.byYearWeek).toBeA('object');
			expect(Object.keys(ret.byYearWeek).length).toBe(0);
		});

		it('should add metrics', function() {
			const service = new DBService({});
			const ret = service.aggregateBackupResultMetrics([
				new BackupResultMetrics({
					backupDate: new Date(Date.UTC(2014, 0, 1, 12, 0, 0, 0)).toISOString(),
					totalBytes: 1,
					totalItems: 2,
					errorCount: 3,
				}),
				new BackupResultMetrics({
					backupDate: new Date(Date.UTC(2014, 0, 1, 12, 0, 0, 0)).toISOString(),
					totalBytes: 40,
					totalItems: 50,
					errorCount: 60,
				}),
				new BackupResultMetrics({
					backupDate: new Date(Date.UTC(2014, 1, 1, 12, 0, 0, 0)).toISOString(),
					totalBytes: 700,
					totalItems: 800,
					errorCount: 900,
				}),
				new BackupResultMetrics({
					backupDate: new Date(Date.UTC(2015, 1, 1, 12, 0, 0, 0)).toISOString(),
					totalBytes: 123,
					totalItems: 456,
					errorCount: 789,
				}),
			]);

			expect(ret).toBeA('object');
			expect(Object.keys(ret).sort()).toEqual([
				'byClient',
				'byYearMonth',
				'byYearWeek',
			]);

			expect(ret.byClient).toEqual({
				backupCount: 4,
				totalBytes: 864,
				totalItems: 1308,
				errorCount: 1752,
			});

			expect(ret.byYearMonth).toEqual({
				2014: {
					1: {
						count: 2,
						bytes: 41,
						items: 52,
						errors: 63,
					},
					2: {
						count: 1,
						bytes: 700,
						items: 800,
						errors: 900,
					},
				},
				2015: {
					2: {
						count: 1,
						bytes: 123,
						items: 456,
						errors: 789,
					},
				},
			});

			expect(ret.byYearWeek).toEqual({
				2014: {
					1: {
						count: 2,
						bytes: 41,
						items: 52,
						errors: 63,
					},
					5: {
						count: 1,
						bytes: 700,
						items: 800,
						errors: 900,
					},
				},
				2015: {
					5: {
						count: 1,
						bytes: 123,
						items: 456,
						errors: 789,
					},
				},
			});
		});
	});
});
