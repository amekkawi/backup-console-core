'use strict';

const expect = require('expect');
const Service = require('../../../lib/Service');
const VerifyEmailRecipientsResult = require('../../../lib/structs/VerifyEmailRecipientsResult');
const EmailRecipient = require('../../../lib/util/email').EmailRecipient;
const ReceivingService = require('../../../lib/services/ReceivingService');

describe('ReceivingService', function() {
	it('should extend from Service', function() {
		expect(ReceivingService.prototype).toBeA(Service, 'Expected ReceivingService %s to extend from %s');
	});

	describe('ReceivingService#verifyEmailRecipients', function() {
		it('should filter out invalid recipients', function() {
			const services = {
				config: {
					RECEIVING_EMAIL_PREFIX: 'correct-prefix',
					RECEIVING_EMAIL_DOMAIN: 'correct-domain.com',
				},
				db: {
					verifyClient() {
						return Promise.reject(new Error('Expected not to be called'));
					},
				},
			};

			const invalidEmailAddresses = Object.freeze([
				'missing-at-sign',
				'invalid-local-part@correct-domain.com',
				'correct-prefix@correct-domain.com', // Missing identifier
				'correct-prefix+invalid-identifier@correct-domain.com',
				'correct-prefix+a.abc.def@incorrect-domain.com',
				'incorrect-prefix+a.abc.def@correct-domain.com',
			]);

			const service = new ReceivingService(services);
			const promise = service.verifyEmailRecipients(invalidEmailAddresses);

			expect(promise).toBeA(Promise);

			return promise.then(function(result) {
				expect(result).toBeA(VerifyEmailRecipientsResult);
				expect(result.status).toBe('NO_MATCHES');
				expect(result.matching).toBeA('array');
				expect(result.matching).toEqual([]);
				expect(result.nonMatching).toBeA('array');
				expect(result.nonMatching).toEqual(invalidEmailAddresses);
			});
		});

		it('should verify first matching e-mail address in DB (matching key)', function() {
			const services = {
				config: {
					RECEIVING_EMAIL_PREFIX: 'correct-prefix',
					RECEIVING_EMAIL_DOMAIN: 'correct-domain.com',
				},
				db: {
					verifyClient: expect.createSpy().andReturn(Promise.resolve('MATCH')),
				},
			};

			const emailAddresses = Object.freeze([
				'correct-prefix+a.xyz.def@correct-domain.com',
				'correct-prefix+a.abc.def@correct-domain.com',
				'incorrect-prefix+a.abc.def@correct-domain.com',
			]);

			const service = new ReceivingService(services);
			return service.verifyEmailRecipients(emailAddresses)
				.then(function(result) {
					expect(services.db.verifyClient.calls.length).toBe(1);
					expect(services.db.verifyClient.calls[0].arguments).toEqual([
						'xyz',
						'def',
					]);

					expect(result).toBeA(VerifyEmailRecipientsResult);
					expect(result.status).toBe('CLIENT_KEY_MATCHED');

					expect(result.matching).toBeA('array');
					expect(result.matching.length).toBe(2);
					expect(result.matching[0]).toBeA(EmailRecipient);
					expect(Object.assign({}, result.matching[0])).toEqual({
						original: 'correct-prefix+a.xyz.def@correct-domain.com',
						backupType: 'a',
						clientId: 'xyz',
						clientKey: 'def',
						domain: 'correct-domain.com',
						prefix: 'correct-prefix',
					});
					expect(result.matching[1]).toBeA(EmailRecipient);
					expect(Object.assign({}, result.matching[1])).toEqual({
						original: 'correct-prefix+a.abc.def@correct-domain.com',
						backupType: 'a',
						clientId: 'abc',
						clientKey: 'def',
						domain: 'correct-domain.com',
						prefix: 'correct-prefix',
					});

					expect(result.nonMatching).toBeA('array');
					expect(result.nonMatching).toEqual(emailAddresses.slice(2));
				});
		});

		it('should verify first matching e-mail address in DB (non-matching key)', function() {
			const services = {
				config: {
					RECEIVING_EMAIL_PREFIX: 'correct-prefix',
					RECEIVING_EMAIL_DOMAIN: 'correct-domain.com',
				},
				db: {
					verifyClient: function() {
						return Promise.resolve('KEY_MISMATCH');
					},
				},
			};

			const emailAddresses = Object.freeze([
				'correct-prefix+a.xyz.def@correct-domain.com',
			]);

			const service = new ReceivingService(services);
			return service.verifyEmailRecipients(emailAddresses)
				.then(function(result) {
					expect(result).toBeA(VerifyEmailRecipientsResult);
					expect(result.status).toBe('CLIENT_KEY_MISMATCH');

					expect(result.matching).toBeA('array');
					expect(result.matching.length).toBe(1);
					expect(result.matching[0]).toBeA(EmailRecipient);
					expect(Object.assign({}, result.matching[0])).toEqual({
						original: 'correct-prefix+a.xyz.def@correct-domain.com',
						backupType: 'a',
						clientId: 'xyz',
						clientKey: 'def',
						domain: 'correct-domain.com',
						prefix: 'correct-prefix',
					});

					expect(result.nonMatching).toBeA('array');
					expect(result.nonMatching).toEqual([]);
				});
		});

		it('should verify first matching e-mail address in DB (client not found)', function() {
			const services = {
				config: {
					RECEIVING_EMAIL_PREFIX: 'correct-prefix',
					RECEIVING_EMAIL_DOMAIN: 'correct-domain.com',
				},
				db: {
					verifyClient: function() {
						return Promise.resolve('NOT_FOUND');
					},
				},
			};

			const emailAddresses = Object.freeze([
				'correct-prefix+a.xyz.def@correct-domain.com',
			]);

			const service = new ReceivingService(services);
			return service.verifyEmailRecipients(emailAddresses)
				.then(function(result) {
					expect(result).toBeA(VerifyEmailRecipientsResult);
					expect(result.status).toBe('CLIENT_NOT_FOUND');

					expect(result.matching).toBeA('array');
					expect(result.matching.length).toBe(1);
					expect(result.matching[0]).toBeA(EmailRecipient);
					expect(Object.assign({}, result.matching[0])).toEqual({
						original: 'correct-prefix+a.xyz.def@correct-domain.com',
						backupType: 'a',
						clientId: 'xyz',
						clientKey: 'def',
						domain: 'correct-domain.com',
						prefix: 'correct-prefix',
					});

					expect(result.nonMatching).toBeA('array');
					expect(result.nonMatching).toEqual([]);
				});
		});
	});

	describe('ReceivingService#verifyBackupResultIdentifier', function() {
		it('ReceivingService#verifyBackupResultIdentifier'); // TODO
	});

	describe('ReceivingService#receiveBackupResult', function() {
		it('ReceivingService#receiveBackupResult'); // TODO
	});
});
