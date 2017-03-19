'use strict';

const expect = require('expect');
const Service = require('../../../lib/Service');
const StorageService = require('../../../lib/services/StorageService');

describe('StorageService', function() {
	it('should extend from Service', function() {
		expect(StorageService.prototype).toBeA(Service, 'Expected StorageService %s to extend from %s');
	});

	[
		'putBackupResultContent',
		'getBackupResultContent',
		'archiveBackupResultContent',
		'findOrphanedBackupResultContent',
	]
		.forEach(function(methodName) {
			describe(`StorageService#${methodName}`, function() {
				it('should return a rejected promise', function() {
					const service = new StorageService({});

					const promise = service[methodName]();
					expect(promise).toBeA(Promise);

					return promise.then(function() {
						throw new Error(`Expected StorageService#${methodName} to not resolve`);
					}, function(err) {
						expect(err).toBeA(Error);
						expect(err.message).toBe(`StorageService#${methodName} not implemented`);
					});
				});
			});
		});
});
