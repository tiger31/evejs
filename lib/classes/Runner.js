const Suite = require('./Suite');
const Mocha = require('./drivers/Mocha');
const errors = require('../errors');
const glob = require('glob');
const fs = require('fs');

/**
 * @class
 * @augments Suite
 * @mixes Hooked
 */
const Runner = class Runner extends Suite {
	/**
	 * @type {object}
	 */
	context = {};
	/**
	 * @type {Array.<Suite>}
	 */
	MISuites = [];
	/**
	 * @external Driver
	 * @type {Driver}
	 */
	driver;
	/**
	 * @type {Array.<string>}
	 */
	files = [];

	/**
	 * @param {object} [config] - Runner configuration
	 * @param {object} [config.test] - Runner tests configuration
	 * @param {string} [config.test.dir='tests'] - Default tests directory
	 * @param {string} [config.test.patten='*.test.js'] - Tests files pattern
	 */
	constructor(config) {
		// noinspection JSCheckFunctionSignatures
		super({name: 'Root'}, config, false);
		this.driver = new this.config.driver();
		//Setting custom getter

		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						seed: this.seed,
						emerge: this.emerge,
						mi: this.mi
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});

		this.init();
	}

	/**
	 * @description
	 * Creates new suite
	 * @param {string} title - Suite title
	 * @param {Function} fn - Suite function
	 * @param {object} config - Config object
	 * @returns {Suite} suite
	 */
	mi = (title, fn, config) => {
		const suite = new Suite({fn, name: title, runner: this}, config);
		this.MISuites.push(suite);
		//Proxy events from suites on runner emitter
		this.proxy([
			this.constructor.events.SEED_END,
			this.constructor.events.SEED_BEGIN,
			this.constructor.events.SEED_FAILED,
			this.constructor.events.SEED_SUCCEEDED,
			this.constructor.events.SUITE_BEGIN,
			this.constructor.events.SUITE_END,
			this.constructor.events.TEST_BEGIN,
			this.constructor.events.TEST_END,
			this.constructor.events.TEST_FAILED,
			this.constructor.events.TEST_SUCCEEDED,
			this.constructor.events.EVENT_HOOK_FAILED,
			this.constructor.events.EVENT_HOOK_SUCCEEDED
		], suite);
		return suite;
	};

	/**
	 * @override
	 * @description
	 * Initializes runner
	 */
	init = () => {
		this.emit(this.constructor.events.EVENT_EXPORT_SETUP);
		this.includeTestFiles();
		this.emit(this.constructor.events.EVENT_EXPORT_TEARDOWN);
	};

	/**
	 * @description
	 * Finds and requires test files
	 * @private
	 */
	includeTestFiles = () => {
		const queue = [];
		const pwd = process.cwd();
		if (!fs.existsSync(this.config.test.dir)) {
			this.error(`Tests directory "${this.config.test.dir}" does not exists`);
		} else {
			try {
				const pattern = `${pwd}/${this.config.test.dir}/${this.config.test.pattern}`;
				const files = glob.sync(pattern);
				// noinspection JSUnresolvedFunction
				files.forEach(file => require(file));
			} catch (error) {
				this.error(error);
			}
		}
	};

	/**
	 * @private
	 * @param {string|Error} error - Error
	 */
	error = (error) => {
		//TODO log error
		// noinspection JSIgnoredPromiseFromCall
		this.exit(error);
	};

	/**
	 * @description
	 * Throws err that kills runner process
	 * @param {string|Error} [message] - Exit message
	 * @private
	 * @throws {Error}
	 */
	exit = (message) => {
		this.runEmerges().then(() => Promise.all(this.suites.map(s => s.runEmerges())));
		throw (message instanceof Error) ? message : new errors.MIRunnerError(message);
	};

	/**
	 * @description
	 * Runner drivers list
	 * @static
	 * @type {object.<string, Driver>}
	 * @enum
	 */
	static drivers = {
		mocha: Mocha
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1,
		mode: this.mode.INTERRUPT_RUN,
		behavior: this.behaviour.INTERRUPT,
		driver: this.drivers.mocha,
		test: {
			dir: 'tests',
			recursive: true,
			pattern: '*.test.js',
		}
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static _deep = [
		'test'
	];

};

module.exports = Runner;