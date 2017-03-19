'use strict';

/**
 * TODO
 *
 * @property {string} deliveryType
 * @property {string} backupId
 * @property {string} createDate
 */
class OrphanedBackupResultContent {
	/**
	 * @param {string} deliveryType
	 * @param {string} backupId
	 * @param {string} createDate
	 */
	constructor(deliveryType, backupId, createDate) {
		this.deliveryType = deliveryType;
		this.backupId = backupId;
		this.createDate = createDate;
	}
}

module.exports = OrphanedBackupResultContent;
