const Runnable = require('./abstract/Runnable');

/**
 * @class
 * @extends Runnable
 */
const Test = class Test extends Runnable {
	/**
	 * @type Runner
	 */
	runner;
	/**
	 * @type Driver
	 */
	driver;

	/**
	 * @constructor
	 * @param args
	 * @param config
	 * @param {Runner} runner - Runner
	 */
	constructor({fn, name, context, runner} = {}, config) {
		super({fn, name, context}, config);
		this.runner = runner;
		this.driver = this.runner.driver
	}

	run() {
		this.driver.test(this.name, this.fn);
	}

};

module.exports = Test;