const TaskRunnable = require('./mixins/TaskRunnable');
const Collectable = require('./mixins/Collectable');
const Filterable = require('./mixins/Filterable');
const Nested = require('./mixins/Nested');
const Proxy = require('./mixins/Proxy');
const EventEmitter = require('events').EventEmitter;
const { performance } = require('perf_hooks');
const utils = require('../utils');

const events = {
	TEST_BEGIN: 'test_begin',
	TEST_END: 'test_end',
	TEST_SUCCEEDED: 'test_succeeded',
	TEST_FAILED: 'test_failed',
	TEST_PENDING: 'test_pending',
};

const states = {
	PASSED: 'PASSED',
	FAILED: 'FAILED',
	PENDING: 'PENDING',
	BROKEN: 'BROKEN'
};

const collect = [
	//Test main part
	'title',
	'state',
	{field: 'error', as: 'error', transform: utils.errorToOj },
	{field: 'parent', as: 'parentId', transform: (parent) => parent._uuid },
	{field: 'runner', as: 'runId', transform: (runner) => runner._uuid },
	'timing',
	//Test filter part
	{field: 'filterConfig', as: 'filter'},
	//Runnable config
	{field: 'timeout', as: 'config.timeout'},
	{field: 'parallel', as: 'config.parallel'},
	{field: 'step', as: 'config.step'},
	{field: 'skip', as: 'config.skip'},
];

module.exports = class Test extends Collectable(Nested(Filterable(Proxy(TaskRunnable(EventEmitter))))) {
	/**
	 * @description
	 * Test state
	 * @type {string}
	 */
	state;
	/**
	 * @external Runner
	 * @type {Runner}
	 */
	runner;
	/**
	 * @description
	 * If test failed stores error
	 * @type {Error}
	 */
	error;
	/**
	 * @description
	 * Test's parent in hierarchy
	 * @type {TestSuite}
	 */
	parent;
	/**
	 * @description
	 * Test's execution time
	 * @type {Number}
	 */
	timing = 0;
	/**
	 * @constructor
	 * @param {object} args - Main test args
	 * @param {object} [config] - Test config
	 * @param {boolean} [config.step=false] - TaskRunnable step flag
	 * @param {boolean} [config.skip=false] - TaskRunnable skip flag
	 * @param {boolean} [config.parallel=false] - TaskRunnable parallel flag
	 * @param {number} [config.timeout=2000] - Runnable timeout
 	 */
	constructor({fn, title, runner, parent} = {}, {
		step = false,
		skip = false,
		parallel = false,
		timeout = 2000,
		scope, epic, feature, story, shadowed
	} = {}) {
		super();
		if (this.isNestingLocked())
			throw new errors.MIConsistenceError(this);
		this.function = fn;
		this.runner = runner;
		this.parent = parent;
		this.title = title;
		this.step = step;
		this.skip = skip;
		this.parallel = parallel;
		this.timeout = timeout;
		this.scope = scope;
		this.epic = epic;
		this.feature = feature;
		this.story = story;
		this.shadowed = shadowed = {};
		this.proxyTo(Object.values(events), runner);
		this.collect(...collect);
	}

	/**
	 *
	 */
	run() {
		this.lock();
		this.emit(events.TEST_BEGIN, this);
		const begin = performance.now();
		return this.delayed().then(() => {
			this.timing = performance.now() - begin;
			this.state = states.PASSED;
			this.emit(events.TEST_SUCCEEDED, this);
		}).catch((err) => {
			this.timing = performance.now() - begin;
			this.error = err;
			this.state = states.FAILED;
			this.emit(events.TEST_FAILED, this);
		}).finally(() => {
			this.release();
			this.emit(events.TEST_END, this);
		});
	}

	/**
	 *
	 */
	ignore() {
		this.state = states.PENDING;
		this.emit(events.TEST_PENDING, this);
		this.emit(events.TEST_END, this);
	}
};

module.exports.events = events;
module.exports.states = states;