const HookedRunnable = require('./abstract/HookedRunnable');
const Test = require('./Test');

/**
 * @class
 * @augments HookedRunnable
 */
const TestSuite = class TestSuite extends HookedRunnable {
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
		return this.runnables.filter(r => r instanceof TestSuite);
	}

	get tests() {
		return this.runnables.filter(r => r instanceof Test);
	}

	/**
	 * @description
	 * Creates new test suite
	 * @param {string} title - Test suite title
	 * @param {Function} fn - Test suite main function
	 * @returns {TestSuite} testSuite - Created test suite
	 */
	suite = (title, fn) => {
		//TODO config
		const suite = new TestSuite({fn, name: title, runner: this.runner, context: this.context});
		this.runnables.push(suite);
		this.proxy([
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
	 * @description
	 * Creates new test
	 * @param {string} title - Test title
	 * @param {Function} fn - Test main function
	 * @returns {Test} test - Created test
	 */
	test = (title, fn) => {
		//TODO config
		const test = new Test({fn, name: title, runner: this.runner, context: this.context});
		this.runnables.push(test);
		test.proxy([
			this.constructor.events.TEST_FAILED,
			this.constructor.events.TEST_SUCCEEDED,
		], test);
		return test;
	};

	/**
	 * @description
	 * Runs test function (main block)
	 * Function do not actually runs tests, because test run is delayed
	 */
	run = async () => {
		await this.runHook(this.constructor.hooks.BEFORE_TESTS, this)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_TEST, err));
		for(const runnable of this.runnables) {
			await this.runSingle(runnable);
		}
		await this.runHook(this.constructor.hooks.AFTER_TESTS, this)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_TEST, err));
	};

	/**
	 * @description
	 * Runs single TestSuite
	 * @param {TestSuite|Test} runnable - Thingy to run
	 * @private
	 */
	runSingle = async (runnable) => {
		const events = (runnable instanceof TestSuite) ? [
			this.constructor.events.SUITE_BEGIN,
			this.constructor.events.SUITE_END
		] : [
			this.constructor.events.TEST_BEGIN,
			this.constructor.events.TEST_END
		];

		await this.runHook(this.constructor.hooks.BEFORE_TEST, this, runnable)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_TEST, err));
		this.emit(events[0], runnable);
		await runnable.run()
			.catch((err) => { this.errors.push(err); });
		this.emit(events[1], runnable);
		await this.runHook(this.constructor.hooks.AFTER_TEST, this, runnable)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.AFTER_TEST, err));
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
	 * @see HookedRunnable
	 */
	static hooks = {
		BEFORE_TESTS: 'beforeTests',
		BEFORE_TEST: 'beforeTest',
		AFTER_TEST: 'afterTest',
		AFTER_TESTS: 'afterTests',
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static nested = true;
};

TestSuite.events.SUITE_BEGIN = 'suiteBegin';
TestSuite.events.SUITE_END = 'suiteEnd';
TestSuite.events.TEST_BEGIN = 'testBegin';
TestSuite.events.TEST_END = 'testEnd';
TestSuite.events.TEST_FAILED = 'testFailed';
TestSuite.events.TEST_SUCCEEDED = 'testSucceeded';

module.exports = TestSuite;