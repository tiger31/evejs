const Suite = require('../Suite');
const Test = require('../Test.new');
const tty = require('tty');
const utils = require('../../utils');

/**
 * @description
 * TTY formatting symbols
 * @enum
 * @static
 * @type {object.<string, string>}
 */
const modifiers = {
	normal: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	red: '\x1b[0;31m',
	green: '\x1b[0;32m',
	yellow: '\x1b[0;33m',
	default: '\x1b[0;39m',
	blue: '\x1b[0;34m',
	cyan: '\x1b[0;36m',
	bg_red: '\x1b[41m',
};
/**
 * @class
 */
const Reporter = class Reporter {
	/**
	 * @description
	 * TTY width
	 * @type {number}
	 */
	width = 64;
	/**
	 * @description
	 * Is stdout tty
	 * @type {boolean}
	 */
	istty = true;

	/**
	 * @external Runner
	 * @param {Runner} runner - Runner
	 */
	constructor(runner) {
		this.runner = runner;
		this.istty = global.process.stdout.isTTY;
		if (this.istty)
			this.width = Math.min((global.process.stdout.getWindowSize) ? global.process.stdout.getWindowSize()[0] : tty.getWindowSize()[1], 64);
	}

	attach = () => {
		this.runner.on(Test.events.TEST_END, this.test);
		this.runner.on(Suite.events.SUITE_BEGIN, this.suite.begin);
		this.runner.on(Suite.events.SUITE_END, this.suite.end);
	};

	/**
	 * @description
	 * Prints test result
	 * @param {Test} test
	 * @abstract
	 */
	test = (test) => {};


	suite = {
		/**
		 * @description
		 * Executed when suite started
		 * @param {Suite} suite
		 * @abstract
		 */
		begin: (suite) => {},
		/**
		 * @description
		 * Executed when suite ended
		 * @param suite
		 * @abstract
		 */
		end: (suite) => {}
	};

	/**
	 *
	 * @param {string} str - Original string
	 * @param {Array.<string>} modifiersArr - Array of modifiers
	 * @returns {string} result - modifies string
	 */
	static modify(str, modifiersArr) {
		return [ ...modifiersArr.map(m => modifiers[m]), str, modifiers.normal ].join('');
	}

};


module.exports = Reporter;
module.exports.modifiers = modifiers;