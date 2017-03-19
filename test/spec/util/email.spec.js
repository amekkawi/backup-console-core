'use strict';

const expect = require('expect');
const emailUtil = require('../../../lib/util/email');

describe('util/email', function() {
	it('should export expected methods', function() {
		expect(Object.keys(emailUtil).sort())
			.toEqual([
				'parseEmailRecipients',
				'parseEmailRecipient',
				'EmailRecipient',
			].sort());
	});

	describe('parseEmailRecipients', function() {
		it('util/email.parseEmailRecipients'); // TODO
	});

	describe('parseEmailRecipient', function() {
		it('util/email.parseEmailRecipient'); // TODO
	});

	describe('EmailRecipient', function() {
		it('util/email.EmailRecipient'); // TODO
	});
});
