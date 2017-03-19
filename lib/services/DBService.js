'use strict';

const Service = require('../Service');
const dateUtil = require('../util/date');

/**
 * TODO
 *
 * @property {Services} services
 */
class DBService extends Service {

	/**
	 * @param {Services} services
	 */
	constructor(services) {
		super(services);
	}

	/**
	 * TODO
	 *
	 * @abstract
	 * @param {string} clientId
	 * @param {string} clientKey
	 * @returns {Promise}
	 */
	addClient(clientId, clientKey) { // eslint-disable-line no-unused-vars
		return Promise.reject(new Error('DBService#addClient not implemented'));
	}

	/**
	 * TODO
	 *
	 * @abstract
	 * @param {string} clientId
	 * @param {object} [options]
	 * @param {string[]} [options.attributes]
	 * @returns {Promise.<null|object>}
	 */
	getClient(clientId, options) { // eslint-disable-line no-unused-vars
		return Promise.reject(new Error('DBService#getClient not implemented'));
	}

	/**
	 * TODO
	 *
	 * @param {string} clientId
	 * @param {string} clientKey
	 * @returns {Promise.<string>} Resolves to "NOT_FOUND", "MATCH" or "KEY_MISMATCH"
	 */
	verifyClient(clientId, clientKey) {
		return this.getClient(clientId, {
			attributes: [
				'clientId',
				'clientKey',
			],
		})
			.then((clientDoc) => {
				if (!clientDoc) {
					return 'NOT_FOUND';
				}
				else if (clientDoc.clientKey === clientKey) {
					return 'MATCH';
				}
				else {
					return 'KEY_MISMATCH';
				}
			});
	}

	/**
	 * TODO
	 *
	 * @abstract
	 * @param {BackupResultMeta} backupResultMeta
	 * @param {BackupResultMetrics} backupResultMetrics
	 * @returns {Promise}
	 */
	addBackupResult(backupResultMeta, backupResultMetrics) { // eslint-disable-line no-unused-vars
		return Promise.reject(new Error('DBService#addBackupResult not implemented'));
	}

	/**
	 * TODO
	 *
	 * @abstract
	 * @param {string} clientId
	 * @param {BackupResultMetrics[]} backupResultMetricsBatch
	 * @returns {Promise}
	 */
	incrementBackupResultMetrics(clientId, backupResultMetricsBatch) { // eslint-disable-line no-unused-vars
		return Promise.reject(new Error('DBService#incrementBackupResultMetrics not implemented'));
	}

	/**
	 * TODO
	 *
	 * @protected
	 * @param {BackupResultMetrics[]} backupResultMetricsBatch
	 * @returns {object}
	 */
	aggregateBackupResultMetrics(backupResultMetricsBatch) {
		const byClient = {
			backupCount: backupResultMetricsBatch.length,
			totalBytes: 0,
			totalItems: 0,
			errorCount: 0,
		};
		const byYearWeek = {};
		const byYearMonth = {};

		backupResultMetricsBatch.forEach((backupResultMetrics) => {
			// Increment client-level totals
			byClient.totalBytes += backupResultMetrics.totalBytes;
			byClient.totalItems += backupResultMetrics.totalItems;
			byClient.errorCount += backupResultMetrics.errorCount;

			const backupDate = new Date(Date.parse(backupResultMetrics.backupDate));

			// Increment monthly totals
			const year = backupDate.getUTCFullYear();
			const month = backupDate.getUTCMonth() + 1;
			const byMonth = (byYearMonth[year] || (byYearMonth[year] = {}));
			const monthMetrics = (byMonth[month] || (byMonth[month] = {
				count: 0,
				bytes: 0,
				items: 0,
				errors: 0,
			}));
			monthMetrics.count++;
			monthMetrics.bytes += backupResultMetrics.totalBytes;
			monthMetrics.items += backupResultMetrics.totalItems;
			monthMetrics.errors += backupResultMetrics.errorCount;

			// Increment ISO weekly totals
			const week = dateUtil.getISOWeekUTC(backupDate);
			const weekYear = dateUtil.getISOWeekYearUTC(backupDate);
			const byWeek = (byYearWeek[weekYear] || (byYearWeek[weekYear] = {}));
			const weekMetrics = (byWeek[week] || (byWeek[week] = {
				count: 0,
				bytes: 0,
				items: 0,
				errors: 0,
			}));
			weekMetrics.count++;
			weekMetrics.bytes += backupResultMetrics.totalBytes;
			weekMetrics.items += backupResultMetrics.totalItems;
			weekMetrics.errors += backupResultMetrics.errorCount;
		});

		return {
			byClient,
			byYearWeek,
			byYearMonth,
		};
	}
}

module.exports = DBService;
