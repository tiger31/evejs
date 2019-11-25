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
	 * @description
	 * Creates test suite for specific framework implementation
	 * @abstract
	 * @param {string} title - Suite title
	 */
	suite = (title) => {
		throw new errors.MIDriverNotImplemented(title);
	};

	/**
	 * @description
	 * Creates test for specific framework implementation
	 * @abstract
	 * @param {string} title - Test title
	 * @param {Function} fn - Test function
	 */
	test = (title, fn) => {
		throw new errors.MIDriverNotImplemented(title, fn);
	};

	/**
	 * @description
	 * Binds files loaded by MI runner to framework runner
	 * @param {Array.<string>} files - List of loaded files
	 */
	files = (files) => {
		throw new errors.MIDriverNotImplemented(files);
	};

	/**
	 * @description
	 * Runs driver
	 */
	run = () => {
		throw new errors.MIDriverNotImplemented();
	};
};

module.exports = Driver;