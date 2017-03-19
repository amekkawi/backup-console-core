'use strict';

const expect = require('expect');
const inspect = require('object-inspect');
const Config = require('../../lib/Config');

describe('Config', function() {
	it('should set props from config', function() {
		const opts = {
			COMMIT_HASH: 'commit-hash',
			RECEIVING_EMAIL_PREFIX: 'rec-email-prefix',
			RECEIVING_EMAIL_DOMAIN: 'rec-email-domain',
			INGEST_WORKER_MAX: 11,
			INGEST_WORKER_MAX_TIME: 22,
			LOGGER_LEVEL: 'loggr-level',
		};
		const config = new Config(opts);

		expect(config.COMMIT_HASH).toBe('commit-hash', 'Expected COMMIT_HASH %s to be %s');
		expect(config.RECEIVING_EMAIL_PREFIX).toBe('rec-email-prefix', 'Expected RECEIVING_EMAIL_PREFIX %s to be %s');
		expect(config.RECEIVING_EMAIL_DOMAIN).toBe('rec-email-domain', 'Expected RECEIVING_EMAIL_DOMAIN %s to be %s');
		expect(config.INGEST_WORKER_MAX).toBe(11, 'Expected INGEST_WORKER_MAX %s to be %s');
		expect(config.INGEST_WORKER_MAX_TIME).toBe(22, 'Expected INGEST_WORKER_MAX_TIME %s to be %s');
		expect(config.LOGGER_LEVEL).toBe('loggr-level', 'Expected LOGGER_LEVEL %s to be %s');
	});

	it('should set default props', function() {
		const config = new Config();
		expect(config.INGEST_WORKER_MAX).toBe(10, 'Expected INGEST_WORKER_MAX %s to be %s');
		expect(config.INGEST_WORKER_MAX_TIME).toBe(60, 'Expected INGEST_WORKER_MAX_TIME %s to be %s');
		expect(config.LOGGER_LEVEL).toBe('DEBUG', 'Expected LOGGER_LEVEL %s to be %s');
	});

	it('should use defaults for numbers if non-numeric value provided', function() {
		getValuesWithout([0, -1, 1, '0', '1', Infinity, -Infinity])
			.forEach(function(value) {
				const config = new Config({
					INGEST_WORKER_MAX: value,
					INGEST_WORKER_MAX_TIME: value,
				});
				expect(config.INGEST_WORKER_MAX).toBe(10, `Expected INGEST_WORKER_MAX %s to be %s for ${inspect(value)}`);
				expect(config.INGEST_WORKER_MAX_TIME).toBe(60, `Expected INGEST_WORKER_MAX_TIME %s to be %s for ${inspect(value)}`);
			});
	});

	it('should set parse string value for numbers', function() {
		const config = new Config({
			INGEST_WORKER_MAX: '11',
			INGEST_WORKER_MAX_TIME: '22',
		});
		expect(config.INGEST_WORKER_MAX).toBe(11, 'Expected INGEST_WORKER_MAX %s to be %s');
		expect(config.INGEST_WORKER_MAX_TIME).toBe(22, 'Expected INGEST_WORKER_MAX_TIME %s to be %s');
	});
});
