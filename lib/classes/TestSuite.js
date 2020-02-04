const HookedRunnable = require('./abstract/HookedRunnable');
const Collectable = require('./mixins/Collectable');
const Manager = require('./mixins/Manager');
const Test = require('./Test');
const ManagerGroup = require('./ManagerGroup');
const utils = require('../utils');
const Promise = require('bluebird');

/**
 * @class
 * @augments HookedRunnable
 * @augments ManagerGroup
 * @augments Collectable
 */
const TestSuite = class TestSuite extends Collectable(Manager(HookedRunnable)) {
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

		this.group = new ManagerGroup({
			hooksFn: this.launchHook,
			before: this.constructor.hooks.BEFORE,
			beforeEach: this.constructor.hooks.BEFORE_EACH,
			afterEach: this.constructor.hooks.AFTER_EACH,
			after: this.constructor.hooks.AFTER,
			context: this.context
		});

		if (init)
			this.init();
	}

	get suites() {
		return this.getGroup().filter(r => r instanceof TestSuite);
	}

	get tests() {
		return this.getGroup().filter(r => r instanceof Test);
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
			this.push(suite);
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
			this.push(test);
		}, true);
	};

	/**
	 * @description
	 * Runs hook and catching errors
	 * @param {string} hook - Hook name
	 */
	launchHook = (hook) => {
		return this.runHook(hook)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(hook, err))
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
			errors: JSON.stringify(this.errors.map(utils.errorToOj)),
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
