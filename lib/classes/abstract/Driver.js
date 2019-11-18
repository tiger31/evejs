const errors = require('../../errors');

/**
 * @abstract
 * @class
 * @type {Driver}
 */
const Driver = class Driver {
	/**
	 * @description
	 * Instance of test framework runner
	 * @type {Object}
	 */
	instance;

	/**
	 * @constructor
	 */
	constructor() {
		this.init();
	}

	/**
	 * @description
	 * Initializes driver
	 */
	init() {
		throw new errors.MIDriverNotImplemented();
	}

	/**
	 * @description
	 * Creates test suite for specific framework implementation
	 * @abstract
	 * @param title
	 * @param fn
	 */
	suite = (title, fn) => {
		throw new errors.MIDriverNotImplemented();
	};

	/**
	 * @description
	 * Creates test for specific framework implementation
	 * @abstract
	 * @param title
	 * @param fn
	 */
	test = (title, fn) => {
		throw new errors.MIDriverNotImplemented();
	};

};

module.exports = Driver;