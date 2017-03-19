'use strict';

const expect = require('expect');
const Services = require('../../lib/Services');

describe('Services', function() {
	const SERVICES = {
		platform: {
			initArgs: (args) => {
				expect(args.length).toBe(0, 'Expected args count %s to be %s');
			},
		},
		config: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.config, 'Expected args[0] %s to be %s');
			},
		},
		logger: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
			},
		},
		queue: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
			},
		},
		db: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
			},
		},
		receiving: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
			},
		},
		ingest: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
			},
		},
		storage: {
			initArgs: (args, map) => {
				expect(args.length).toBe(1, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
			},
		},
		parse: {
			initArgs: (args, map) => {
				expect(args.length).toBe(2, 'Expected args count %s to be %s');
				expect(args[0]).toBe(map.services, 'Expected args[0] %s to be %s');
				expect(args[1]).toBe(map.backupResultParsers, 'Expected args[1] %s to be %s');
			},
		},
	};

	afterEach(function() {
		expect.restoreSpies();
	});

	describe('Services.Services.initPlatformServiceLog', function() {
		it('should call console.log if time is > 200');
	});

	describe('Services.initPlatformService', function() {
		it('should init service and set as non-writable prop', function() {
			expect(Services.initPlatformService).toBeA(Function);

			const services = {};
			const service = {};
			const args = ['a', 'b'];
			const initSpy = expect.createSpy().andReturn(service);
			const cbSpy = expect.createSpy();

			const ret = Services.initPlatformService(
				services,
				'config',
				{ config: initSpy },
				args,
				cbSpy
			);

			expect(ret).toBe(service);
			expect(services.config).toBe(service);
			expect(initSpy.calls.length).toBe(1);
			expect(initSpy.calls[0].arguments.length).toBe(2);
			expect(initSpy.calls[0].arguments[0]).toBe('a');
			expect(initSpy.calls[0].arguments[1]).toBe('b');
			expect(cbSpy.calls.length).toBe(1);
			expect(cbSpy.calls[0].arguments.length).toBe(2);
			expect(cbSpy.calls[0].arguments[0]).toBe('config');
			expect(cbSpy.calls[0].arguments[1]).toBeA('number');

			expect(function() {
				services.config = {};
			}).toThrow(TypeError);
		});

		it('should allow cb to be optional', function() {
			Services.initPlatformService(
				{},
				'config',
				{ config: () => ({}) },
				[]
			);
		});

		it('should throw if not implemented on platformServices', function() {
			expect(function() {
				Services.initPlatformService(
					{},
					'config',
					{},
					[]
				);
			}).toThrowWithProps(Error, {
				message: 'Service for "config" not implemented',
			});
		});
	});

	describe('Class', function() {
		// Check the initialization of each service.
		Object.keys(SERVICES).forEach(function(serviceName) {
			it(`should init "${serviceName}"`, function() {
				const config = {};
				const platformServices = {};
				const backupResultParsers = {};
				const service = {};

				const initSpy = expect.spyOn(Services, 'initPlatformService')
					.andReturn(service);

				const services = new Services(config, platformServices, backupResultParsers);

				expect(initSpy.calls.length).toBe(0);
				expect(services[serviceName]).toBe(service);
				expect(initSpy.calls.length).toBe(1);
				expect(initSpy.calls[0].arguments.length).toBe(5);
				expect(initSpy.calls[0].arguments[0]).toBe(services);
				expect(initSpy.calls[0].arguments[1]).toBe(serviceName);
				expect(initSpy.calls[0].arguments[2]).toBe(platformServices);
				expect(initSpy.calls[0].arguments[3]).toBeA('array');
				SERVICES[serviceName].initArgs(initSpy.calls[0].arguments[3], {
					services,
					config,
					platformServices,
					backupResultParsers,
				});
				expect(initSpy.calls[0].arguments[4]).toBe(Services.initPlatformServiceLog);
			});
		});
	});
});
