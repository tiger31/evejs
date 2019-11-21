const Driver = require('../abstract/Driver');
const MochaRunner = require('mocha');
require('mocha-steps');

/**
 * @class
 * @augments Driver
 */
const Mocha = class Mocha extends Driver {
	/**
	 * @override
	 * @see Driver
	 * @param {object} config - Mocha config
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
		this.instance.describe(title, fn);
	};

	/**
	 * @description
	 * Creates mocha test
	 * @override
	 * @see Driver
	 */
	test = (title, fn) => {
		this.instance.it(title, fn);
	};

	/**
	 * @description
	 * Binds files to mocha runner
	 * @override
	 * @see Driver
	 */
	files = (files) => {
		this.instance.files = files;
	}

};

module.exports = Mocha;