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
	 * @type {object}
	 */
	instance;

	/**
	 * @param {...*} args - Driver arguments
	 */
	constructor(...args) {
		this.init(...args);
	}

	/**
	 * @description
	 * Initializes driver
	 */
	init() {
		throw new errors.MIDriverNotImplemented();
	}

	/**
	 * @external Driven
	 * @description
	 * Creates test suite for specific framework implementation
	 * @abstract
	 * @param {string} title - Suite title
	 * @param {Driven} inst - Instance of driven object
	 * @returns {*} Framework instance
	 */
	suite = (title, inst) => {
		throw new errors.MIDriverNotImplemented(title);
	};

	/**
	 * @description
	 * Creates test for specific framework implementation
	 * @abstract
	 * @param {string} title - Test title
	 * @param {Function} fn - Test function
	 * @param {Driven} inst - Instance of driven object
	 * @returns {*} Framework instance
	 */
	test = (title, fn, inst) => {
		throw new errors.MIDriverNotImplemented(title, fn);
	};

	/**
	 * @description
	 * Runs driver
	 */
	run = () => {
		throw new errors.MIDriverNotImplemented();
	};

	/**
	 *
	 * @param {object.<Driven>} driven
	 * @param {*} framework
	 * @protected
	 */
	_bind(driven, framework) {
		framework[this.constructor.drivenKey] = driven.getAugmentation();
	}

	/**
	 * @description
	 * Sets key on framework object to be bing with Driven object
	 * @type {string}
	 */
	static drivenKey = '__driven';

};

module.exports = Driver;