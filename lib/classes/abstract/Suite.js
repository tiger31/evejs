const HookedRunnable = require('./HookedRunnable');
const Test = require('../Test');

/**
 * @class
 * @augments HookedRunnable
 */
const Suite = class TestSuite extends HookedRunnable {
	/**
	 * @type {Array.<TestSuite|Test>}
	 */
	runnables = [];
	/**
	 * @type {boolean}
	 */
	initialized = false;
	/**
	 * @type {Array.<Error>}
	 */
	errors = [];

	/**
	 * @external Runner
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {Runner} args.runner - Runner
	 * @param {object} config - Test suite config
	 * @param {boolean} [init=true] - Pre-initialized. If true, runs main function in constructor to initialize nested entities
	 */
	constructor({fn, name, runner, context} = {}, config, init = true) {
		super({fn, name, context}, config);
		this.runner = runner;

		//Setting custom getter
		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						suite: this.suite,
						test: this.test,
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});
		if (init)
			this.init();
	}

	get suites() {
		return this.runnables.filter(r => r instanceof Suite);
	}

	get tests() {
		return this.runnables.filter(r => r instanceof Test);
	}

	/**
	 * @description
	 * Creates new test suite
	 * @param {string} title - Test suite title
	 * @param {Function} fn - Test suite main function
	 * @param {object} config - Test config
	 * @see Suite.default
	 */
	suite = (title, fn, config = {}) => {
		this.runner.filter(config, this.config,() => {
			const suite = new TestSuite({fn, name: title, runner: this.runner, context: this.context}, config);
			this.runnables.push(suite);
		});
	};

	/**
	 * @description
	 * Creates new test
	 * @param {string} title - Test title
	 * @param {Function} fn - Test main function
	 * @param {object} config - Test config
	 * @see Test.default
	 */
	test = (title, fn, config = {}) => {
		//TODO config
		this.runner.filter(config, this.config, () => {
			const test = new Test({fn, name: title, runner: this.runner, context: this.context}, config);
			this.runnables.push(test);
		}, true);
	};

	/**
	 * @description
	 * Runs test function (main block)
	 * Function do not actually runs tests, because test run is delayed
	 */
	run = async () => {
		this.external = this.runner.driver.suite(this.name);
		for(const runnable of this.runnables) {
			await this.runSingle(runnable);
		}
	};

	/**
	 * @description
	 * Runs single TestSuite
	 * @param {Suite|Test} runnable - Thingy to run
	 * @private
	 */
	runSingle = async (runnable) => {
		await runnable.run()
			.catch((err) => { this.errors.push(err); });
	};

	/**
	 * @override
	 * @see Runnable
	 */
	init = () => {
		this.emit(this.constructor.events.EVENT_RUNNABLE_BEGIN);
		try {
			this.fn(this.context);
			this.initialized = true;
		} catch (error) {
			this.errors.push(error);
			throw error;
		}
		this.emit(this.constructor.events.EVENT_RUNNABLE_END);
	};

	/**
	 * @description
	 * Handles hook fail
	 * @param {string} hook - Hook
	 * @param {Error} error - Error
	 * @protected
	 */
	_onHookFail = (hook, error) => {
		this.errors.push(error);
		this.emit(this.constructor.events.EVENT_HOOK_FAILED, this, hook, error);
	};

	/**
	 * @external Hook
	 * @description
	 * Handles hook success
	 * @param {Hook} hook - Hook
	 * @protected
	 */
	_onHookSuccess = (hook) => {
		this.emit(this.constructor.events.EVENT_HOOK_SUCCEEDED, this, hook);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1,
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static nested = true;
};

module.exports = Suite;