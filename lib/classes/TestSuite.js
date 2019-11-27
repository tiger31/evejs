const Suite = require('./abstract/Suite');
const Driven = require('./mixins/Driven');
const Test = require('./Test');

/**
 * @class
 * @augments Suite
 */
module.exports = class TestSuite extends Driven(Suite) {
	/**
	 * @override
	 * @see Suite
	 * @see Driven
	 * @returns {Promise<void>}
	 */
	run() {
		this.external = this.runner.driver.suite(this.name);
		return super.run();
	}
};