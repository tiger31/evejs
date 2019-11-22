const Runnable = require('./abstract/Runnable');

/**
 * @class
 * @augments Runnable
 */
const Test = class Test extends Runnable {
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
	run = async () => {
		console.log('test called');
		this.driver.test(this.name, this.fn);
	};
};

Test.events.TEST_FAILED = 'testFailed';
Test.events.TEST_SUCCEEDED = 'testSucceeded';

module.exports = Test;