const Runnable = require('./abstract/Runnable');
const Driven = require('./mixins/Driven');
const Collectable = require('./mixins/Collectable');
const utils = require('../utils');
const Promise = require('bluebird');

/**
 * @class
 * @augments Runnable
 */
const Test = class Test extends Collectable(Runnable) {
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
	 * @external Driver
	 * @type {Driver}
	 */
	driver;
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
	 * @external TestSuite
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {Runner} args.runner - Runner
	 * @param {TestSuite} args.parent - Test's parent
	 * @param {object} config - Test config
	 */
	constructor({fn, name, context, runner, parent} = {}, config) {
		super({fn, name, context}, config);
		this.runner = runner;
		this.parent = parent;
		this.driver = this.runner.driver;
		this.on(this.constructor.events.EVENT_RUNNABLE_SKIP, () => {
			this.state = this.constructor.states.PENDING;
			this.emit(this.constructor.events.TEST_PENDING);
		})
	}

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
			state: this.state,
			config: JSON.stringify(this.config),
			error: JSON.stringify(utils.errorToOj(this.error)),
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
	 * @description
	 * Adds test to driver
	 */
	run = () => {
		return Promise.try(() => {
			this.emit(this.constructor.events.TEST_BEGIN, this);
			return super.run();
		}).then(() => {
			this.state = this.constructor.states.PASSED;
			this.emit(this.constructor.events.TEST_SUCCEEDED, this);
		}).catch((err) => {
			this.state = this.constructor.states.FAILED;
			this.emit(this.constructor.events.TEST_FAILED, this, err);
		}).finally(() => {
			this.emit(this.constructor.events.TEST_END, this);
		})
	};

	/**
	 * @static
	 * @type {string}
	 */
	static consistenceKey = 'Test';

	/**
	 * @description
	 * Test states
	 * @enum {string}
	 * @static
	 */
	static states = {
		PASSED: 'PASSED',
		FAILED: 'FAILED',
		PENDING: 'PENDING'
	};
};

Test.events.TEST_BEGIN = 'test_begin';
Test.events.TEST_END = 'test_end';
Test.events.TEST_SUCCEEDED = 'test_succeeded';
Test.events.TEST_FAILED = 'test_failed';
Test.events.TEST_PENDING = 'test_pending';

module.exports = Test;