'use strict';

class Config {
	constructor(config) {
		config = config || {};

		this.COMMIT_HASH = config.COMMIT_HASH;
		this.RECEIVING_EMAIL_PREFIX = config.RECEIVING_EMAIL_PREFIX;
		this.RECEIVING_EMAIL_DOMAIN = config.RECEIVING_EMAIL_DOMAIN;
		this.INGEST_WORKER_MAX = parseInt(config.INGEST_WORKER_MAX, 10) || 10;
		this.INGEST_WORKER_MAX_TIME = parseInt(config.INGEST_WORKER_MAX_TIME, 10) || 60;
		this.INGEST_WORKER_STARTUP_TIME = parseInt(config.INGEST_WORKER_STARTUP_TIME, 10) || 4;
		this.INGEST_WORKER_TIME_PER_RESULT = parseInt(config.INGEST_WORKER_TIME_PER_RESULT, 10) || 4;
		this.INGEST_WORKER_MIN_INCREMENT = parseInt(config.INGEST_WORKER_MIN_INCREMENT, 10) || 10;
		this.INGEST_WORKER_MIN_LIMIT = parseInt(config.INGEST_WORKER_MIN_LIMIT, 10) || 3;
		this.LOGGER_LEVEL = config.LOGGER_LEVEL || 'DEBUG';
	}
}

module.exports = Config;
