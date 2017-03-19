'use strict';

const expect = require('expect');
const Service = require('../../../lib/Service');
const QueueService = require('../../../lib/services/QueueService');

describe('QueueService', function() {
	it('should extend from Service', function() {
		expect(QueueService.prototype).toBeA(Service, 'Expected QueueService %s to extend from %s');
	});

	[
		'getAvailableReceivedBackupResults',
		'queueReceivedBackupResult',
		'dequeueReceivedBackupResults',
	]
		.forEach(function(methodName) {
			describe(`QueueService#${methodName}`, function() {
				it('should return a rejected promise', function() {
					const service = new QueueService({});

					const promise = service[methodName]();
					expect(promise).toBeA(Promise);

					return promise.then(function() {
						throw new Error(`Expected QueueService#${methodName} to not resolve`);
					}, function(err) {
						expect(err).toBeA(Error);
						expect(err.message).toBe(`QueueService#${methodName} not implemented`);
					});
				});
			});
		});

	describe('QueueService#resolveReceivedBackupResult', function() {
		const service = new QueueService({});

		const promise = service.resolveReceivedBackupResult({});
		expect(promise).toBeA(Promise);
		return promise;
	});
});
