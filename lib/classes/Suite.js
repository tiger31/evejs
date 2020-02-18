const TaskRunnable = require('./mixins/TaskRunnable');
const Collectable = require('./mixins/Collectable');
const Filterable = require('./mixins/Filterable');
const Exporter = require('./mixins/Exporter');
const Manager = require('./mixins/Manager');
const Proxy = require('./mixins/Proxy');
const HookEvents = require('./abstract/Hook').events;
const EventEmitter = require('events').EventEmitter;
const Test = require('./Test');
const TaskGroup = require('./TaskGroup');

const hooks = {
	BEFORE: 'before',
	BEFORE_EACH: 'beforeEach',
	AFTER: 'after',
	AFTER_EACH: 'afterEach',
};

const events = {
	SUITE_BEGIN: 'suiteBegin',
	SUITE_END: 'suiteEnd',
	SUITE_PARALLEL_BEGIN: 'suiteParallelBegin',
	SUITE_PARALLEL_END: 'suiteParallelEnd',
	SUITE_PENDING: 'suitePending'
};

/**
 * @class
 * @augments Manager
 * @augments TaskRunnable
 * @augments Collectable
 */
const Suite = class Suite extends Manager(Proxy(Exporter(Filterable(TaskRunnable(EventEmitter))))) {
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
	state;

	/**
	 * @external Runner
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {Runner} args.runner - Runner
	 * @param {Suite} args.parent - Suite's parent
	 * @param {object} config - Test suite config
	 * @param {boolean} init - Call init function in constructor
	 */
	constructor({fn, title, runner, parent} = {}, {
		parallel = false,
		step = false,
		skip = false,
		scope, epic, feature, story, shadowed
	} = {}, init = true) {
		super();
		this.function = fn;
		this.title = title;
		this.timeout = -1;
		this.runner = runner;
		this.parent = parent;
		//
		this.parallel = parallel;
		this.step = step;
		this.skip = skip;
		this.scope = scope;
		this.epic = epic;
		this.feature = feature;
		this.story = story;
		this.shadowed = shadowed || {};

		this.exports = {
			controls: {
				test: this.test,
				suite: this.suite,
			},
			hooks: Object.values(hooks).reduce((o, h) => { o[h] = (fn, config) => {
				return this.registerHook(h, fn, title);
			}; return o; }, {})
		};
		if (init) {
			this.init();
			this.proxyTo([...Object.values(events), ...Object.values(HookEvents)], runner);
		}
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
		this.runner.filter(config, this.filterConfig,(config) => {
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
		this.runner.filter(config, this.filterConfig, () => {
			const test = new Test({fn, title, runner: this.runner, parent: this}, config);
			this.runnables.push(test);
		}, true);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	init = () => {
		this.export();
		this.function && this.function();
		this.retain();
	};

	_skipFilter = (task) => {
		return (task.state === Test.states.FAILED || task.state === Test.states.BROKEN) && task.step === true
	};

	skipCondition = (task) => {
		if (task instanceof TaskGroup) {
			this.emit(events.SUITE_PARALLEL_END, this);
			return task.tasks.map(t => t.runnable).some(this._skipFilter);
		} else {
			return this._skipFilter(task.runnable);
		}
	};

	/**
	 *
	 */
	run() {
		this.emit(events.SUITE_BEGIN, this);
		if (this.parallels.length > 0) {
			this.emit(events.SUITE_PARALLEL_BEGIN, this)
		}
		return this.launch(this.hooks[hooks.BEFORE], this.hooks[hooks.BEFORE_EACH], this.hooks[hooks.AFTER_EACH], this.hooks[hooks.AFTER])
			.finally(() => {
				this.state = (this.runnables.some(r => r.state === Test.states.FAILED || r.state === Test.states.BROKEN)) ? Test.states.FAILED : Test.states.PASSED;
				this.emit(events.SUITE_END, this);
			});
	}

	ignore() {
		this.state = Test.states.PENDING;
		this.emit(events.SUITE_PENDING);
	}

};

module.exports = Suite;
module.exports.hooks = hooks;
module.exports.events = events;
