const TaskRunnable = require('./mixins/TaskRunnable');
const Nested = require('./mixins/Nested');
const EventEmitter = require('events').EventEmitter;
const { performance } = require('perf_hooks');

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
	PENDING: 'PENDING'
};

module.exports = class Test extends Nested(TaskRunnable(EventEmitter)) {
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
	timing;
	/**
	 * @constructor
	 * @param {object} args - Main test args
	 * @param {object} [config] - Test config
	 * @param {boolean} [config.step=false] - TaskRunnable step flag
	 * @param {boolean} [config.skip=false] - TaskRunnable skip flag
	 * @param {boolean} [config.parallel=false] - TaskRunnable parallel flag
	 * @param {boolean} [config.timeout=2000] - Runnable timeout
 	 */
	constructor({fn, title, runner, parent} = {}, {step, skip, parallel, timeout} = {}) {
		super();
		this.function = fn;
		this.runner = runner;
		this.parent = parent;
		this.title = title;
		this.step = step;
		this.skip = skip;
		this.parallel = parallel;
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
};

module.exports.events = events;
module.exports.states = states;