const Runner = require('../Runner');
const Driver = require('../abstract/Driver');
const MochaRunner = require('mocha');
require('mocha-steps');

/**
 * @class
 * @augments Driver
 */
const Mocha = class Mocha extends Driver {
	/**
	 * @external Runner
	 * @override
	 * @see Driver
	 * @param {object} config - Mocha config
	 * @param {Runner} runner - Runner
	 */
	init(config, runner) {
		this.runner = runner;
		this.instance = new MochaRunner(config);
		this.instance.delay();
		this.instance.suite.emit(MochaRunner.Suite.constants.EVENT_FILE_PRE_REQUIRE, global, '', this.instance);
		/**
		 * @description
		 * Suites pull
		 * @type {Array.<Mocha.Suite>}
		 */
		this.suites = [this.instance.suite];
		this.runner.framework = new Promise((resolve, reject) => {
			try {
				this.instance = this.instance.run(error => {
					if (error) reject(error);
					resolve();
				});
			}	catch (error) {
				reject(error);
			}
		});
		this.runner.on(this.runner.constructor.events.EVENT_SUITE_END, () => {
			this.suites.shift();
		})
	}

	/**
	 * @description
	 * Creates mocha suite
	 * @override
	 * @see Driver
	 */
	suite = (title) => {
		const suite = MochaRunner.Suite.create(this.suites[this.suites.length - 1], title);
		this.suites.push(suite);
	};

	/**
	 * @description
	 * Creates mocha test
	 * @override
	 * @see Driver
	 */
	test = (title, fn) => {
		const test = new MochaRunner.Test(title, fn);
		this.suites[this.suites.length - 1].addTest(test);
	};

	/**
	 * @description
	 * Binds files to mocha runner
	 * @override
	 * @see Driver
	 */
	files = (files) => {
		this.instance.files = files;
	};

	run = () => {
		run();
	}

};

module.exports = Mocha;