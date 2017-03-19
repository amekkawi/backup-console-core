'use strict';

const _backupResultParsers = Symbol('_backupResultParsers');
const _platformServices = Symbol('_platformServices');
const _config = Symbol('_config');

class Services {
	/**
	 * @param {object} config
	 * @param {object} platformServices
	 * @param {object.<string,object>} backupResultParsers
	 */
	constructor(config, platformServices, backupResultParsers) {
		this[_config] = config;
		this[_platformServices] = platformServices;
		this[_backupResultParsers] = backupResultParsers;
	}

	/**
	 * Get the core library for the platform.
	 *
	 * @returns {*}
	 */
	get platform() {
		return Services.initPlatformService(
			this,
			'platform',
			this[_platformServices],
			[],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {Config}
	 */
	get config() {
		return Services.initPlatformService(
			this,
			'config',
			this[_platformServices],
			[this[_config]],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {LoggerService}
	 */
	get logger() {
		return Services.initPlatformService(
			this,
			'logger',
			this[_platformServices],
			[this],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {QueueService}
	 */
	get queue() {
		return Services.initPlatformService(
			this,
			'queue',
			this[_platformServices],
			[this],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {DBService}
	 */
	get db() {
		return Services.initPlatformService(
			this,
			'db',
			this[_platformServices],
			[this],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {ReceivingService}
	 */
	get receiving() {
		return Services.initPlatformService(
			this,
			'receiving',
			this[_platformServices],
			[this],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {IngestService}
	 */
	get ingest() {
		return Services.initPlatformService(
			this,
			'ingest',
			this[_platformServices],
			[this],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {StorageService}
	 */
	get storage() {
		return Services.initPlatformService(
			this,
			'storage',
			this[_platformServices],
			[this],
			Services.initPlatformServiceLog
		);
	}

	/**
	 * @returns {ParserService}
	 */
	get parse() {
		return Services.initPlatformService(
			this,
			'parse',
			this[_platformServices],
			[this, this[_backupResultParsers]],
			Services.initPlatformServiceLog
		);
	}
}

Services.initPlatformService = function(services, prop, platformServices, args, cb) {
	if (typeof platformServices[prop] !== 'function') {
		throw new Error(`Service for "${prop}" not implemented`);
	}

	const start = Date.now();

	const value = platformServices[prop].apply(null, args);
	Object.defineProperty(services, prop, { value });

	const diff = Date.now() - start;
	cb && cb(prop, diff);

	return value;
};

Services.initPlatformServiceLog = function(prop, time) {
	if (time > 200) {
		// eslint-disable-next-line no-console
		console.log(`Service ${prop} took ${time}ms to load`);
	}
};

module.exports = Services;
