const Runnable = require('./abstract/Runnable');
const Driven = require('./mixins/Driven');

/**
 * @class
 * @augments Runnable
 */
const Test = class Test extends Driven(Runnable) {
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
	 *
	 */
	run = () => {
		this.external = this.driver.test(this.name, this.fn, this);
	};

	static states = {
		PASSED: 0,
		FAILED: 1,
		PENDING: 2
	};
};

module.exports = Test;