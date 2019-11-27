const Runnable = require('./abstract/Runnable');
const Driven = require('./mixins/Driven');

/**
 * @class
 * @augments Runnable
 */
const Test = class Test extends Driven(Runnable) {
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
		this.external = this.driver.test(this.name, this.fn, );
	};
};

module.exports = Test;