const Driver = require('../abstract/Driver');
const External = require('../External');
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
		this.suites = [ this.instance.suite ];
		this.runner.framework = new Promise((resolve, reject) => {
			try {
				this.instance = this.instance.run((error) => {
					if (error) reject(error);
					resolve();
				});
			}	catch (error) {
				reject(error);
			}
		});
		this.runner.proxy([
			{ from: MochaRunner.Runner.constants.EVENT_SUITE_BEGIN, to: this.runner.constructor.events.SUITE_BEGIN },
			{ from: MochaRunner.Runner.constants.EVENT_SUITE_END, to: this.runner.constructor.events.SUITE_END },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_BEGIN, to: this.runner.constructor.events.TEST_BEGIN },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_END, to: this.runner.constructor.events.TEST_END },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_FAIL, to: this.runner.constructor.events.TEST_FAILED },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_PASS, to: this.runner.constructor.events.TEST_SUCCEEDED },
			MochaRunner.Runner.constants.EVENT_TEST_PENDING,
			MochaRunner.Runner.constants.EVENT_TEST_RETRY,
		], this.instance);
		this.runner.on(this.runner.constructor.events.SUITE_END, () => {
			this.suites.pop();
		});
	}

	/**
	 * @description
	 * Creates mocha suite
	 * @override
	 * @see Driver
	 * @returns {External}
	 */
	suite = (title) => {
		const suite = MochaRunner.Suite.create(this.suites[this.suites.length - 1], title);
		this.suites.push(suite);
		// noinspection JSAccessibilityCheck
		return new External({
			exports: {
				before: suite.before,
				beforeEach: suite.beforeAll,
				after: suite.after,
				afterAll: suite.afterAll
			},
			external: suite
		});
	};

	/**
	 * @description
	 * Creates mocha test
	 * @override
	 * @see Driver
	 * @returns {External}
	 */
	test = (title, fn) => {
		const test = new MochaRunner.Test(title, fn);
		this.suites[this.suites.length - 1].addTest(test);
		return new External({
			external: test
		});
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
		global.run();
	};

};

module.exports = Mocha;