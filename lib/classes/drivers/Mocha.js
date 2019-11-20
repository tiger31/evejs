const Driver = require('../abstract/Driver');
const MochaRunner = require('mocha');
require('mocha-steps');

/**
 * @class
 * @extends Driver
 */
const Mocha = class Mocha extends Driver {
	/**
	 * @override
	 * @see Driver
	 * @param {Object} config - Mocha config
	 */
	init(config) {
		this.instance = new MochaRunner(config);
		this.instance.delay();
	}

	/**
	 * @description
	 * Creates mocha suite
	 * @override
	 * @see Driver
	 */
	suite = (title, fn) => {
		MochaRunner.describe(title, fn);
	};

	/**
	 * @description
	 * Creates mocha test
	 * @override
	 * @see Driver
	 */
	test = (title, fn) => {
		MochaRunner.it(title, fn);
	}

};

module.exports = Mocha;