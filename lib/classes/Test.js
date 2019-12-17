const Runnable = require('./abstract/Runnable');
const Driven = require('./mixins/Driven');
const Collectable = require('./mixins/Collectable');
const utils = require('../utils');

/**
 * @class
 * @augments Runnable
 */
const Test = class Test extends Collectable(Driven(Runnable)) {
	/**
	 * @description
	 * Test state
	 * @type {number}
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
		this.external = this.driver.test(this.name, this.fn, this);
	};

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

module.exports = Test;