const HookedRunnable = require('./abstract/HookedRunnable');
const Collectable = require('./mixins/Collectable');
const Test = require('./Test');
const utils = require('../utils');

/**
 * @class
 * @augments HookedRunnable
 */
const TestSuite = class TestSuite extends Collectable(HookedRunnable) {
	/**
	 * @type {Array.<TestSuite|Test>}
	 */
	runnables = [];
	/**
	 * @type {Array.<Error>}
	 */
	errors = [];
	/**
	 * @description
	 * Suite's parent in hierarchy
	 * @type {TestSuite}
	 */
	parent;

	/**
	 * @external Runner
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {Runner} args.runner - Runner
	 * @param {TestSuite} args.parent - Suite's parent
	 * @param {object} config - Test suite config
	 * @param {boolean} [init=true] - Pre-initialized. If true, runs main function in constructor to initialize nested entities
	 */
	constructor({fn, name, runner, context, parent} = {}, config, init = true) {
		super({fn, name, context}, config);
		this.runner = runner;
		this.parent = parent;

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
	 * @param {object} config - Test config
	 * @see TestSuite.default
	 */
	suite = (title, fn, config = {}) => {
		this.runner.filter(config, this.config,() => {
			const suite = new TestSuite({fn, name: title, runner: this.runner, context: this.context, parent: this}, config);
			this.proxy([
				this.constructor.events.EVENT_SUITE_PREPARED
			], suite);
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
			const test = new Test({fn, name: title, runner: this.runner, context: this.context, parent: this}, config);
			this.runnables.push(test);
		}, true);
	};

	/**
	 * @description
	 * Runs test function (main block)
	 * Function do not actually runs tests, because test run is delayed
	 */
	run = async () => {
		this.emit(this.constructor.events.SUITE_BEGIN);
		await this.runHook(this.constructor.hooks.BEFORE)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE, err));
		for(const runnable of this.runnables) {
			await this.runHook(this.constructor.hooks.BEFORE_EACH)
				.then(this._onHookSuccess)
				.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_EACH, err));
			//TODO parallel/step/skip
			await runnable.run(this.context);
			await this.runHook(this.constructor.hooks.AFTER_EACH)
				.then(this._onHookSuccess)
				.catch(err => this._onHookFail(this.constructor.hooks.AFTER_EACH, err));
		}
		await this.runHook(this.constructor.hooks.AFTER)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.AFTER, err));
		this.emit(this.constructor.events.SUITE_END);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	init = () => {
		this.emit(this.constructor.events.EVENT_RUNNABLE_BEGIN);
		try {
			this.fn(this.context);
			this.runnables.forEach(r => { if (r instanceof TestSuite) r.init(); });
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
	* @see Collectable
	*/
	collect = () => {
		return {
			id: this._collectable_uuid,
			parentId: this.parent._collectable_uuid,
			run_id: this.runner._collectable_uuid,
			name: this.name,
			config: JSON.stringify(this.config),
			errors: JSON.stringify(this.errors),
			suites: this.suites.map(s => s.collect()),
			tests: this.tests.map(t => t.collect()),
			filter: {
				scope: this.config.scope,
				epic: this.config.epic,
				feature: this.config.feature,
				story: this.config.story,
				project_id: this.config.id
			}
		}
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

TestSuite.hooks.BEFORE = 'before';
TestSuite.hooks.BEFORE_EACH = 'beforeEach';
TestSuite.hooks.AFTER = 'after';
TestSuite.hooks.AFTER_EACH = 'afterEach';

TestSuite.events.EVENT_SUITE_PREPARED = 'suitePrepared';
TestSuite.events.SUITE_BEGIN = 'suiteBegin';
TestSuite.events.SUITE_END = 'suiteEnd';

module.exports = TestSuite;
