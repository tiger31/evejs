const EventEmitter = require('events').EventEmitter;
const errors = require('../../errors');

/**
 * @abstract
 * @class
 * @type {Driver}
 */
const Driver = class Driver extends EventEmitter {
	/**
	 * @description
	 * Instance of test framework runner
	 * @type {object}
	 */
	instance;
	/**
	 * @description
	 * List of tests undetected by runner
	 * Such thing can happen if someone adds tests/suite bypassing runner exports
	 * @typedef Undetected
	 * @property {*} entity - Framework entity
	 * @property {*} state - Entity state
	 * @type {Array.<Undetected>}
	 */
	undetected = [];

	/**
	 * @param {...*} args - Driver arguments
	 */
	constructor(...args) {
		super();
		this.init(...args);
		this.on(this.constructor.events.EVENT_UNDETECTED_ENTITY, (entity, state) => {
			this.undetected.push({entity, state});
		})
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
	 *
	 * @param {*} test
	 * @param {*} state
	 */
	result = (test, state) => {
		throw new errors.MIDriverNotImplemented(test, state);
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

	static events = {
		EVENT_UNDETECTED_ENTITY: 'undetected'
	}

};

module.exports = Driver;