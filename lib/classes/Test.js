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
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {Runner} args.runner - Runner
	 * @param {object} config - Test config
	 */
	constructor({fn, name, context, runner} = {}, config) {
		super({fn, name, context}, config);
		this.runner = runner;
		this.driver = this.runner.driver;
	}

	/**
	 * @override
	 * @see Collectable
	 */
	collect = () => {
		return {
			uuid: this._collectable_uuid,
			name: this.name,
			state: this.state,
			config: this.config,
			error: utils.errorToOj(this.error)
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