'use strict';

const expect = require('expect');
const Service = require('../../lib/Service');

describe('Service', function() {
	it('should services as prop', function() {
		const services = {};
		const service = new Service(services);
		expect(service.services).toBe(services);
	});

	it('should prevent services prop from being set', function() {
		const service = new Service({});
		expect(function() {
			service.services = {};
		}).toThrow(TypeError);
	});
});
