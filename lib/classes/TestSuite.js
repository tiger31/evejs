const HookedRunnable = require('./abstract/HookedRunnable');
const errors = require('../errors');
const Test = require('./Test');

/**
 * @class
 * @extends HookedRunnable
 */
const TestSuite = class TestSuite extends HookedRunnable {
	/**
	 * @type {Array.<Runnable>}
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
	 * @constructor
	 */
	constructor({fn, name, runner, context} = {}, config) {
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
	}

	get suites() {
		return this.runnables.filter(r => r instanceof TestSuite);
	}

	get tests() {
		return this.runnables.filter(r => r instanceof Test)
	}

	/**
	 * @description
	 * Creates new test suite
	 */
	suite = (title, fn) => {
		//TODO config
		const suite = new TestSuite({fn, name: title, runner: this.runner, context: this.context});
		this.runnables.push(suite);
		return suite;
	};

	/**
	 * @description
	 * Creates new test
	 */
	test = (title, fn) => {
		//TODO config
		const test = new Test({fn, name: title, runner: this.runner, context: this.context});
		this.runnables.push(test);
		return test;
	};

	/**
	 * @description
	 * Runs test function (main block)
	 * Function do not actually runs tests, because test run is delayed
	 */
	runTests = async () => {
		await this.runHook(this.constructor.hooks.BEFORE_TEST, this);
		try {
			//TODO test
			this.fn(this.context);
		} catch (error) {
			this.errors.push(error);
			await this.runHook(this.constructor.hooks.AFTER_TEST, this);
			throw new errors.MIFrameworkError(error);
		}
		await this.runHook(this.constructor.hooks.AFTER_TEST, this);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	run = () => {
		this.emit(this.constructor.events.EVENT_RUNNABLE_BEGIN);
		try {
			this.fn();
			this.initialized = true;
		} catch (error) {
			this.errors.push(error);
		}
		this.emit(this.constructor.events.EVENT_RUNNABLE_END);
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
	static nested = true;
};

module.exports = TestSuite;