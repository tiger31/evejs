const TaskRunnable = require('./mixins/TaskRunnable');
const Collectable = require('./mixins/Collectable');
const Manager = require('./mixins/Manager');
const EventEmitter = require('events').EventEmitter;
const Test = require('./Test.new');

const hooks = {
	BEFORE: 'before',
	BEFORE_EACH: 'beforeEach',
	AFTER: 'after',
	AFTER_EACH: 'afterEach',
};

const events = {
	SUITE_BEGIN: 'suiteBegin',
	SUITE_END: 'suiteEnd',
};

/**
 * @class
 * @augments Manager
 * @augments TaskRunnable
 * @augments Collectable
 */
const Suite = class Suite extends Manager(TaskRunnable(EventEmitter)) {
	/**
	 * @type {Array.<Error>}
	 */
	errors = [];
	/**
	 * @description
	 * Suite's parent in hierarchy
	 * @type {Suite}
	 */
	parent;

	/**
	 * @external Runner
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {Runner} args.runner - Runner
	 * @param {Suite} args.parent - Suite's parent
	 * @param {object} config - Test suite config
	 */
	constructor({fn, title, runner, parent} = {}, config) {
		super();
		this.function = fn;
		this.title = title;
		this.runner = runner;
		this.parent = parent;
		this.timeout = -1;

		this.exports = {
			controls: {
				test: this.test,
				suite: this.suite,
			},
			hooks: Object.values(hooks).reduce((o, h) => { o[h] = (fn, config) => {
				return this.registerHook(h, fn, title);
			}}, {})
		};

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
			const suite = new Suite({fn, title, runner: this.runner, parent: this}, config);
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
		this.runner.filter(config, this.config, () => {
			const test = new Test({fn, title, runner: this.runner, parent: this}, config);
			this.runnbales.push(test);
		}, true);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	init = () => {
		return super.delayed();
	};

	/**
	 *
	 */
	run() {
		return super.launch(this.hooks[hooks.BEFORE], this.hooks[hooks.BEFORE_EACH], this.hooks[hooks.AFTER_EACH], this.hooks[hooks.AFTER]);
	}

};



module.exports = Suite;
module.exports.hooks = hooks;
module.exports.events = events;
