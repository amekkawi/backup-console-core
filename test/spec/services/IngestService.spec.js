'use strict';

const expect = require('expect');
const Service = require('../../../lib/Service');
const BackupResultMeta = require('../../../lib/structs/BackupResultMeta');
const BackupResultMetrics = require('../../../lib/structs/BackupResultMetrics');
const IngestService = require('../../../lib/services/IngestService');
const errors = require('../../../lib/util/errors');

describe('IngestService', function() {
	it('should extend from Service', function() {
		expect(IngestService.prototype).toBeA(Service, 'Expected IngestService %s to extend from %s');
	});

	[
		'invokeQueueWorker',
	]
		.forEach(function(methodName) {
			describe(`IngestService#${methodName}`, function() {
				it('should return a rejected promise', function() {
					const service = new IngestService({});

					const promise = service[methodName]();
					expect(promise).toBeA(Promise);

					return promise.then(function() {
						throw new Error(`Expected IngestService#${methodName} to not resolve`);
					}, function(err) {
						expect(err).toBeA(Error);
						expect(err.message).toBe(`IngestService#${methodName} not implemented`);
					});
				});
			});
		});

	[
		'extractQueueMessagePayload',
		'extractBackupResultMetaEmail',
		'extractBackupResultMetaHTTPPost',
	]
		.forEach(function(methodName) {
			describe(`IngestService#${methodName}`, function() {
				it('should throw an Error', function() {
					const service = new IngestService({});

					try {
						service[methodName]();
					}
					catch (err) {
						expect(err).toBeA(Error);
						expect(err.message).toBe(`IngestService#${methodName} not implemented`);
						return;
					}

					throw new Error(`Expected IngestService#${methodName} to throw`);
				});
			});
		});

	describe('IngestService#getWorkerInvokeCount', function() {
		it('should have minimum based on INGEST_WORKER_MIN_INCREMENT and INGEST_WORKER_MIN_LIMIT', function() {
			{
				const services = {
					config: {
						INGEST_WORKER_MAX: 100,
						INGEST_WORKER_MAX_TIME: 300,
						INGEST_WORKER_STARTUP_TIME: 0,
						INGEST_WORKER_TIME_PER_RESULT: 1,
						INGEST_WORKER_MIN_INCREMENT: 10,
						INGEST_WORKER_MIN_LIMIT: 3,
					},
				};

				const service = new IngestService(services);
				expect(service.getWorkerInvokeCount(1)).toBe(1);
				expect(service.getWorkerInvokeCount(9)).toBe(1);
				expect(service.getWorkerInvokeCount(10)).toBe(1);
				expect(service.getWorkerInvokeCount(11)).toBe(1);
				expect(service.getWorkerInvokeCount(19)).toBe(1);
				expect(service.getWorkerInvokeCount(20)).toBe(2);
				expect(service.getWorkerInvokeCount(21)).toBe(2);
				expect(service.getWorkerInvokeCount(29)).toBe(2);
				expect(service.getWorkerInvokeCount(30)).toBe(3);
				expect(service.getWorkerInvokeCount(40)).toBe(3);
				expect(service.getWorkerInvokeCount(100)).toBe(3);
			}

			{
				const services = {
					config: {
						INGEST_WORKER_MAX: 100,
						INGEST_WORKER_MAX_TIME: 300,
						INGEST_WORKER_STARTUP_TIME: 0,
						INGEST_WORKER_TIME_PER_RESULT: 1,
						INGEST_WORKER_MIN_INCREMENT: 5,
						INGEST_WORKER_MIN_LIMIT: 4,
					},
				};

				const service = new IngestService(services);
				expect(service.getWorkerInvokeCount(1)).toBe(1);
				expect(service.getWorkerInvokeCount(4)).toBe(1);
				expect(service.getWorkerInvokeCount(5)).toBe(1);
				expect(service.getWorkerInvokeCount(9)).toBe(1);
				expect(service.getWorkerInvokeCount(10)).toBe(2);
				expect(service.getWorkerInvokeCount(14)).toBe(2);
				expect(service.getWorkerInvokeCount(15)).toBe(3);
				expect(service.getWorkerInvokeCount(20)).toBe(4);
				expect(service.getWorkerInvokeCount(100)).toBe(4);
			}
		});

		it('should use determine results per worker using INGEST_WORKER_MAX_TIME, INGEST_WORKER_STARTUP_TIME and INGEST_WORKER_TIME_PER_RESULT', function() {
			{
				const services = {
					config: {
						INGEST_WORKER_MAX: 1000000,
						INGEST_WORKER_MAX_TIME: 50,
						INGEST_WORKER_STARTUP_TIME: 10,
						INGEST_WORKER_TIME_PER_RESULT: 10,
						INGEST_WORKER_MIN_INCREMENT: 100000,
						INGEST_WORKER_MIN_LIMIT: 100000,
					},
				};

				const service = new IngestService(services);
				expect(service.getWorkerInvokeCount(1)).toBe(1);
				expect(service.getWorkerInvokeCount(4)).toBe(1);
				expect(service.getWorkerInvokeCount(5)).toBe(2);
				expect(service.getWorkerInvokeCount(6)).toBe(2);
				expect(service.getWorkerInvokeCount(8)).toBe(2);
				expect(service.getWorkerInvokeCount(9)).toBe(3);
				expect(service.getWorkerInvokeCount(10)).toBe(3);
			}

			{
				const services = {
					config: {
						INGEST_WORKER_MAX: 1000000,
						INGEST_WORKER_MAX_TIME: 50,
						INGEST_WORKER_STARTUP_TIME: 0,
						INGEST_WORKER_TIME_PER_RESULT: 10,
						INGEST_WORKER_MIN_INCREMENT: 100000,
						INGEST_WORKER_MIN_LIMIT: 100000,
					},
				};

				const service = new IngestService(services);
				expect(service.getWorkerInvokeCount(1)).toBe(1);
				expect(service.getWorkerInvokeCount(5)).toBe(1);
				expect(service.getWorkerInvokeCount(6)).toBe(2);
				expect(service.getWorkerInvokeCount(9)).toBe(2);
				expect(service.getWorkerInvokeCount(10)).toBe(2);
				expect(service.getWorkerInvokeCount(11)).toBe(3);
			}

			{
				const services = {
					config: {
						INGEST_WORKER_MAX: 1000000,
						INGEST_WORKER_MAX_TIME: 100,
						INGEST_WORKER_STARTUP_TIME: 75,
						INGEST_WORKER_TIME_PER_RESULT: 5,
						INGEST_WORKER_MIN_INCREMENT: 100000,
						INGEST_WORKER_MIN_LIMIT: 100000,
					},
				};

				const service = new IngestService(services);
				expect(service.getWorkerInvokeCount(5)).toBe(1);
				expect(service.getWorkerInvokeCount(6)).toBe(2);
				expect(service.getWorkerInvokeCount(7)).toBe(2);
			}
		});

		it('should never be more than INGEST_WORKER_MAX', function() {
			{
				const services = {
					config: {
						INGEST_WORKER_MAX: 3,
						INGEST_WORKER_MAX_TIME: 100000,
						INGEST_WORKER_STARTUP_TIME: 5,
						INGEST_WORKER_TIME_PER_RESULT: 1,
						INGEST_WORKER_MIN_INCREMENT: 1,
						INGEST_WORKER_MIN_LIMIT: 10,
					},
				};

				const service = new IngestService(services);
				expect(service.getWorkerInvokeCount(100000)).toBe(3);
			}
		});
	});

	describe('IngestService#runQueueConsumer', function() {
		it('should call QueueService#getAvailableReceivedBackupResults', function() {
			const expectedError = new Error();
			const getAvailSpy = expect.createSpy().andCall(function() {
				expect(logSpy.calls.length).toBe(1);
				expect(logSpy.calls[0].arguments).toEqual([
					'trace',
					'runQueueConsumer',
				]);
				return Promise.reject(expectedError);
			});
			const logSpy = expect.createSpy();
			const services = {
				queue: {
					getAvailableReceivedBackupResults: getAvailSpy,
				},
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			service.getWorkerInvokeCount = function() {
				throw new Error('Expected not to be called');
			};

			const promise = service.runQueueConsumer();
			expect(promise).toBeA(Promise);

			return promise.then(function() {
				throw new Error('Expected IngestService#runQueueConsumer to not resolve');
			}, function(err) {
				if (err !== expectedError) {
					throw err;
				}

				expect(getAvailSpy.calls.length).toBe(1);
				expect(logSpy.calls.length).toBe(1);
			});
		});

		it('should no available results', function() {
			const logSpy = expect.createSpy();
			const services = {
				queue: {
					getAvailableReceivedBackupResults() {
						expect(logSpy.calls.length).toBe(1);
						expect(logSpy.calls[0].arguments).toEqual([
							'trace',
							'runQueueConsumer',
						]);
						return Promise.resolve(0);
					},
				},
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			service.getWorkerInvokeCount = function() {
				throw new Error('Expected not to be called');
			};

			const promise = service.runQueueConsumer();
			expect(promise).toBeA(Promise);

			return promise.then(function() {
				expect(logSpy.calls.length).toBe(2);
				expect(logSpy.calls[1].arguments).toEqual([
					'debug',
					'No available backup results',
				]);
			});
		});

		it('should get worker invoke count and invoke workers', function() {
			const logSpy = expect.createSpy();
			const services = {
				queue: {
					getAvailableReceivedBackupResults() {
						expect(logSpy.calls.length).toBe(1);
						expect(logSpy.calls[0].arguments).toEqual([
							'trace',
							'runQueueConsumer',
						]);
						return Promise.resolve(100);
					},
				},
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			const getCountSpy = expect.spyOn(service, 'getWorkerInvokeCount').andCall(function() {
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(100);
				return 5;
			});

			const invokeSpy = expect.spyOn(service, 'invokeQueueWorker').andCall(function() {
				return Promise.resolve();
			});

			const promise = service.runQueueConsumer();
			expect(promise).toBeA(Promise);

			return promise.then(function() {
				expect(logSpy.calls.length).toBe(2);
				expect(logSpy.calls[1].arguments).toEqual([
					'debug',
					{
						workerCount: 5,
						availableResults: 100,
					},
					'Invoking workers',
				]);
				expect(getCountSpy.calls.length).toBe(1);
				expect(invokeSpy.calls.length).toBe(5);
			});
		});

		it('should invoke all workers even if one or more fail to invoke', function() {
			const expectedError = new Error();
			const logSpy = expect.createSpy();
			const services = {
				queue: {
					getAvailableReceivedBackupResults() {
						expect(logSpy.calls.length).toBe(1);
						expect(logSpy.calls[0].arguments).toEqual([
							'trace',
							'runQueueConsumer',
						]);
						return Promise.resolve(100);
					},
				},
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			service.getWorkerInvokeCount = function() {
				return 5;
			};

			const invokeSpy = expect.spyOn(service, 'invokeQueueWorker').andCall(function() {
				return invokeSpy.calls.length === 2
					? Promise.reject(expectedError)
					: Promise.resolve();
			});

			const promise = service.runQueueConsumer();
			expect(promise).toBeA(Promise);

			return promise.then(function() {
				expect(logSpy.calls.length).toBe(3);
				expect(logSpy.calls[1].arguments).toEqual([
					'debug',
					{
						workerCount: 5,
						availableResults: 100,
					},
					'Invoking workers',
				]);

				expect(logSpy.calls[2].arguments).toEqual([
					'error',
					{ err: expectedError },
					'Failed to invoke queue worker',
				]);
				expect(logSpy.calls[2].arguments[1].err).toBe(expectedError);
				expect(invokeSpy.calls.length).toBe(5);
			});
		});
	});

	describe('IngestService#ingestQueuedBackupResult', function() {
		it('should call IngestService#extractQueueMessagePayload', function() {
			const expectedMessage = { is: 'message' };
			const expectedError = new Error();
			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			const extractPayloadSpy = expect.spyOn(service, 'extractQueueMessagePayload')
				.andCall(function() {
					expect(logSpy.calls.length).toBe(1);
					expect(logSpy.calls[0].arguments).toEqual([
						'debug',
						'Extract queue message payload',
					]);
					return Promise.reject(expectedError);
				});

			service.extractBackupResultMeta = function() {
				throw new Error('Expected not to be called');
			};

			service.ingestBackupResult = function() {
				throw new Error('Expected not to be called');
			};

			return service.ingestQueuedBackupResult('ingest-id', expectedMessage)
				.then(function() {
					throw new Error('Expected to not resolve');
				}, function(err) {
					if (err !== expectedError) {
						throw err;
					}

					expect(extractPayloadSpy.calls.length).toBe(1);
					expect(extractPayloadSpy.calls[0].arguments).toBeArguments([
						'ingest-id',
						expectedMessage,
					]);
				});
		});

		it('should call IngestService#extractBackupResultMeta with result of extractQueueMessagePayload', function() {
			const expectedPayload = { is: 'payload' };
			const expectedError = new Error();
			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			service.extractQueueMessagePayload = function() {
				return Promise.resolve(expectedPayload);
			};

			const extractMetaSpy = expect.spyOn(service, 'extractBackupResultMeta')
				.andCall(function() {
					expect(logSpy.calls.length).toBe(2);
					expect(logSpy.calls[1].arguments).toEqual([
						'debug',
						'Extract backup result meta',
					]);
					return Promise.reject(expectedError);
				});

			service.ingestBackupResult = function() {
				throw new Error('Expected not to be called');
			};

			return service.ingestQueuedBackupResult('ingest-id', {})
				.then(function() {
					throw new Error('Expected to not resolve');
				}, function(err) {
					if (err !== expectedError) {
						throw err;
					}

					expect(extractMetaSpy.calls.length).toBe(1);
					expect(extractMetaSpy.calls[0].arguments).toBeArguments([
						'ingest-id',
						expectedPayload,
					]);
				});
		});

		it('should call IngestService#ingestBackupResult with result of extractBackupResultMeta', function() {
			const expectedMeta = { is: 'meta' };
			const expectedError = new Error();
			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			service.extractQueueMessagePayload = function() {
				return Promise.resolve({});
			};

			service.extractBackupResultMeta = function() {
				return Promise.resolve(expectedMeta);
			};

			const ingestSpy = expect.spyOn(service, 'ingestBackupResult')
				.andCall(function() {
					return Promise.reject(expectedError);
				});

			return service.ingestQueuedBackupResult('ingest-id', {})
				.then(function() {
					throw new Error('Expected to not resolve');
				}, function(err) {
					if (err !== expectedError) {
						throw err;
					}

					expect(ingestSpy.calls.length).toBe(1);
					expect(ingestSpy.calls[0].arguments).toBeArguments([
						'ingest-id',
						expectedMeta,
					]);
				});
		});

		it('should return the BackupResultMeta', function() {
			const expectedMeta = { is: 'meta' };
			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
			};

			const service = new IngestService(services);

			service.extractQueueMessagePayload = function() {
				return Promise.resolve({});
			};

			service.extractBackupResultMeta = function() {
				return Promise.resolve(expectedMeta);
			};

			service.ingestBackupResult = function() {
				return Promise.resolve({});
			};

			return service.ingestQueuedBackupResult('ingest-id', {})
				.then(function(result) {
					expect(result).toBe(expectedMeta);
				});
		});
	});

	describe('IngestService#ingestBackupResult', function() {
		it('should get client using DBService#verifyClient', function() {
			const expectedError = new Error('expected-error');
			const expectedMeta = new BackupResultMeta(
				'delivery-type',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient: expect.createSpy()
						.andCall(function() {
							expect(logSpy.calls.length).toBe(2);

							expect(logSpy.calls[0].arguments).toEqual([
								'debug',
								{
									ingestId: 'ingest-id',
									backupResultMeta: expectedMeta,
								},
								'Ingesting backup result',
							]);
							expect(logSpy.calls[0].arguments[1].backupResultMeta).toBe(expectedMeta);

							expect(logSpy.calls[1].arguments).toEqual([
								'debug',
								{
									clientId: 'client-id',
									clientKey: 'client-key',
								},
								'Verify client',
							]);

							return Promise.reject(expectedError);
						}),
				},
			};

			const service = new IngestService(services);
			const promise = service.ingestBackupResult('ingest-id', expectedMeta);

			expect(promise).toBeA(Promise);
			return promise.then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (err !== expectedError) {
					throw err;
				}

				expect(services.db.getClient.calls.length).toBe(1);
				expect(services.db.getClient.calls[0].arguments).toEqual([
					'client-id',
					{
						attributes: [
							'clientId',
							'clientKey',
						],
					},
				]);
			});
		});

		it('should throw InvalidBackupPayloadError if client not found', function() {
			const expectedMeta = new BackupResultMeta(
				'delivery-type',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve(null);
					},
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (!(err instanceof errors.InvalidBackupPayloadError)) {
					throw err;
				}

				expect(err.message).toBe('Client not found: client-id');
				expect(err.code).toBe('CLIENT_NOT_FOUND');
				expect(err.ingestId).toBe('ingest-id');
				expect(err.backupId).toBe('backup-id');
				expect(err.clientId).toBe('client-id');
			});
		});

		it('should throw InvalidBackupPayloadError if client key mismatch', function() {
			const expectedMeta = new BackupResultMeta(
				'delivery-type',
				'client-id',
				'invalid-client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (!(err instanceof errors.InvalidBackupPayloadError)) {
					throw err;
				}

				expect(err.message).toBe('Client key mismatch for client-id with invalid-client-key');
				expect(err.code).toBe('CLIENT_KEY_MISMATCH');
				expect(err.ingestId).toBe('ingest-id');
				expect(err.backupId).toBe('backup-id');
				expect(err.clientId).toBe('client-id');
			});
		});

		it('should get the backup result content from storage', function() {
			const expectedError = new Error('expected-error');
			const expectedMeta = new BackupResultMeta(
				'delivery-type',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
				},
				storage: {
					getBackupResultContent: expect.createSpy()
						.andCall(function() {
							return Promise.reject(expectedError);
						}),
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (err !== expectedError) {
					throw err;
				}

				expect(services.storage.getBackupResultContent.calls.length).toBe(1);
				expect(services.storage.getBackupResultContent.calls[0].arguments).toEqual([
					'backup-id',
				]);
			});
		});

		it('should throw InvalidBackupPayloadError if unsupported delivery type', function() {
			const expectedMeta = new BackupResultMeta(
				'invalid-delivery-type',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
				},
				storage: {
					getBackupResultContent() {
						return Promise.resolve(new Buffer(''));
					},
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (!(err instanceof errors.InvalidBackupPayloadError)) {
					throw err;
				}

				expect(err.message).toBe('Unsupported delivery type: invalid-delivery-type');
				expect(err.code).toBe('UNSUPPORTED_DELIVERY_TYPE');
				expect(err.ingestId).toBe('ingest-id');
				expect(err.backupId).toBe('backup-id');
				expect(err.deliveryType).toBe('invalid-delivery-type');
			});
		});

		it('should throw InvalidBackupPayloadError if ParserService#extractEmailMetrics rejects', function() {
			const expectedContent = new Buffer('expected-content');
			const expectedError = new Error('expected-error');
			const expectedMeta = new BackupResultMeta(
				'email',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
				},
				storage: {
					getBackupResultContent() {
						return Promise.resolve(expectedContent);
					},
				},
				parse: {
					extractEmailMetrics: expect.createSpy()
						.andCall(function() {
							expect(logSpy.calls.length).toBe(3);
							expect(logSpy.calls[2].arguments).toEqual([
								'debug',
								'Extract metrics from email delivery',
							]);
							return Promise.reject(expectedError);
						}),
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (!(err instanceof errors.InvalidBackupPayloadError)) {
					throw err;
				}

				expect(services.parse.extractEmailMetrics.calls.length).toBe(1);
				expect(services.parse.extractEmailMetrics.calls[0].arguments).toBeArguments([
					'backup-type',
					expectedContent,
				]);

				expect(err.message).toBe('Extract metrics failed');
				expect(err.code).toBe('EXTRACT_METRICS');
				expect(err.ingestId).toBe('ingest-id');
				expect(err.backupId).toBe('backup-id');
				expect(err.extractMetricsError).toBe(expectedError);
			});
		});

		it('should throw InvalidBackupPayloadError if ParserService#extractHTTPPostMetrics rejects', function() {
			const expectedContent = new Buffer('expected-content');
			const expectedError = new Error('expected-error');
			const expectedMeta = new BackupResultMeta(
				'httppost',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
				},
				storage: {
					getBackupResultContent() {
						return Promise.resolve(expectedContent);
					},
				},
				parse: {
					extractHTTPPostMetrics: expect.createSpy()
						.andCall(function() {
							expect(logSpy.calls.length).toBe(3);
							expect(logSpy.calls[2].arguments).toEqual([
								'debug',
								'Extract metrics from httppost delivery',
							]);
							return Promise.reject(expectedError);
						}),
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (!(err instanceof errors.InvalidBackupPayloadError)) {
					throw err;
				}

				expect(services.parse.extractHTTPPostMetrics.calls.length).toBe(1);
				expect(services.parse.extractHTTPPostMetrics.calls[0].arguments).toBeArguments([
					'backup-type',
					expectedContent,
				]);

				expect(err.message).toBe('Extract metrics failed');
				expect(err.code).toBe('EXTRACT_METRICS');
				expect(err.ingestId).toBe('ingest-id');
				expect(err.backupId).toBe('backup-id');
				expect(err.extractMetricsError).toBe(expectedError);
			});
		});

		it('should pass metrics to DBService#addBackupResult', function() {
			const expectedError = new Error('expected-error');
			const expectedMeta = new BackupResultMeta(
				'email',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			);
			const expectedMetrics = new BackupResultMetrics({
				backupDate: '2017-03-21T23:42:29.917Z',
			});

			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
					addBackupResult: expect.createSpy()
						.andCall(function() {
							expect(logSpy.calls.length).toBe(4);
							expect(logSpy.calls[3].arguments).toEqual([
								'debug',
								{
									backupResultMetrics: expectedMetrics,
								},
								'Add backup result to DB',
							]);
							expect(logSpy.calls[3].arguments[1].backupResultMetrics).toBe(expectedMetrics);
							return Promise.reject(expectedError);
						}),
				},
				storage: {
					getBackupResultContent() {
						return Promise.resolve(new Buffer(''));
					},
				},
				parse: {
					extractEmailMetrics() {
						return Promise.resolve(expectedMetrics);
					},
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', expectedMeta).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (err !== expectedError) {
					throw err;
				}

				expect(services.db.addBackupResult.calls.length).toBe(1);
				expect(services.db.addBackupResult.calls[0].arguments).toBeArguments([
					expectedMeta,
					expectedMetrics,
				]);
			});
		});

		it('should call StorageService#archiveBackupResultContent after successfully adding backup result', function() {
			const expectedError = new Error('expected-error');
			const logSpy = expect.createSpy();
			const services = {
				logger: createLoggerFixture(logSpy),
				db: {
					getClient() {
						return Promise.resolve({
							clientId: 'client-id',
							clientKey: 'client-key',
						});
					},
					addBackupResult() {
						return Promise.resolve();
					},
				},
				storage: {
					getBackupResultContent() {
						return Promise.resolve(new Buffer(''));
					},
					archiveBackupResultContent: expect.createSpy()
						.andCall(function() {
							expect(logSpy.calls.length).toBe(5);
							expect(logSpy.calls[4].arguments).toEqual([
								'debug',
								'Archive backup result content',
							]);
							return Promise.reject(expectedError);
						}),
				},
				parse: {
					extractHTTPPostMetrics() {
						return Promise.resolve(new BackupResultMetrics({
							backupDate: '2017-03-21T23:42:29.917Z',
						}));
					},
				},
			};

			const service = new IngestService(services);
			return service.ingestBackupResult('ingest-id', new BackupResultMeta(
				'httppost',
				'client-id',
				'client-key',
				'backup-type',
				'backup-id'
			)).then(() => {
				throw new Error('Expected to not resolve');
			}, (err) => {
				if (err !== expectedError) {
					throw err;
				}

				expect(services.storage.archiveBackupResultContent.calls.length).toBe(1);
				expect(services.storage.archiveBackupResultContent.calls[0].arguments).toEqual([
					'backup-id',
					'ingest-id',
				]);
			});
		});

		it('should resolve after archiving content', function() {
			it('should call StorageService#archiveBackupResultContent after successfully adding backup result', function() {
				const logSpy = expect.createSpy();
				const services = {
					logger: createLoggerFixture(logSpy),
					db: {
						getClient() {
							return Promise.resolve({
								clientId: 'client-id',
								clientKey: 'client-key',
							});
						},
						addBackupResult() {
							return Promise.resolve();
						},
					},
					storage: {
						getBackupResultContent() {
							return Promise.resolve(new Buffer(''));
						},
						archiveBackupResultContent() {
							return Promise.resolve();
						},
					},
					parse: {
						extractHTTPPostMetrics() {
							return Promise.resolve(new BackupResultMetrics({
								backupDate: '2017-03-21T23:42:29.917Z',
							}));
						},
					},
				};

				const service = new IngestService(services);
				return service.ingestBackupResult('ingest-id', new BackupResultMeta(
					'httppost',
					'client-id',
					'client-key',
					'backup-type',
					'backup-id'
				));
			});
		});
	});

	describe('IngestService#extractBackupResultMeta', function() {
		it('should throw InvalidBackupPayloadError if could not extract meta', function() {
			const expectedEmailError = new Error('email-error');
			const expectedHTTPPostError = new Error('httppost-error');
			const expectedPayload = 'expected-payload';
			const service = new IngestService({});

			service.extractBackupResultMetaEmail = expect.createSpy()
				.andThrow(expectedEmailError);

			service.extractBackupResultMetaHTTPPost = expect.createSpy()
				.andThrow(expectedHTTPPostError);

			expect(function() {
				service.extractBackupResultMeta('ingest-id', expectedPayload);
			}).toThrowWithProps(errors.InvalidBackupPayloadError, {
				message: 'Invalid queue JSON (failed to extract payload)',
				code: 'INVALID_QUEUE_JSON',
				ingestId: 'ingest-id',
				backupId: null,
				queuePayload: expectedPayload,
				extractErrors: {
					email: expectedEmailError.stack,
					httppost: expectedHTTPPostError.stack,
				},
			});
		});

		it('should throw InvalidBackupPayloadError if could not extract meta, with only messages for PayloadExtractError', function() {
			const expectedEmailError = new errors.PayloadExtractError('email-error');
			const expectedHTTPPostError = new errors.PayloadExtractError('httppost-error');
			const expectedPayload = 'expected-payload';
			const service = new IngestService({});

			service.extractBackupResultMetaEmail = expect.createSpy()
				.andThrow(expectedEmailError);

			service.extractBackupResultMetaHTTPPost = expect.createSpy()
				.andThrow(expectedHTTPPostError);

			expect(function() {
				service.extractBackupResultMeta('ingest-id', expectedPayload);
			}).toThrowWithProps(errors.InvalidBackupPayloadError, {
				message: 'Invalid queue JSON (failed to extract payload)',
				code: 'INVALID_QUEUE_JSON',
				ingestId: 'ingest-id',
				backupId: null,
				queuePayload: expectedPayload,
				extractErrors: {
					email: 'email-error',
					httppost: 'httppost-error',
				},
			});
		});

		it('should return email meta', function() {
			const expectedMeta = { is: 'meta' };
			const service = new IngestService({});
			service.extractBackupResultMetaEmail = function() {
				return expectedMeta;
			};
			expect(service.extractBackupResultMeta('ingest-id', 'payload')).toBe(expectedMeta);
		});

		it('should return httppost meta', function() {
			const expectedMeta = { is: 'meta' };
			const service = new IngestService({});
			service.extractBackupResultMetaEmail = function() {
				throw new Error();
			};
			service.extractBackupResultMetaHTTPPost = function() {
				return expectedMeta;
			};
			expect(service.extractBackupResultMeta('ingest-id', 'payload')).toBe(expectedMeta);
		});
	});
});

function createLoggerFixture(overrides) {
	if (typeof overrides === 'function') {
		return {
			trace: overrides.bind(null, 'trace'),
			debug: overrides.bind(null, 'debug'),
			info: overrides.bind(null, 'info'),
			warn: overrides.bind(null, 'warn'),
			error: overrides.bind(null, 'error'),
			fatal: overrides.bind(null, 'fatal'),
		};
	}

	return Object.assign({
		trace() {
		},
		debug() {
		},
		info() {
		},
		warn() {
		},
		error() {
		},
		fatal() {
		},
	}, overrides || {});
}
