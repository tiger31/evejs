const Driver = require('../abstract/Driver');
const External = require('../External');
const Test = require('../Test');
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
		this.runner._framework = new Promise((resolve, reject) => {
			try {
				this.instance = this.instance.run((error) => {
					if (error) reject(error);
					resolve();
				});
			}	catch (error) {
				reject(new error.MIFrameworkError(error));
			}
		});
		this.runner.proxy([
			{ from: MochaRunner.Runner.constants.EVENT_SUITE_BEGIN, to: this.runner.constructor.events.SUITE_BEGIN },
			{ from: MochaRunner.Runner.constants.EVENT_SUITE_END, to: this.runner.constructor.events.SUITE_END },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_BEGIN, to: this.runner.constructor.events.TEST_BEGIN },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_END, to: this.runner.constructor.events.TEST_END },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_FAIL, to: this.runner.constructor.events.TEST_FAILED },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_PASS, to: this.runner.constructor.events.TEST_SUCCEEDED },
			{ from: MochaRunner.Runner.constants.EVENT_TEST_PENDING, to: this.runner.constructor.events.TEST_PENDING },
			MochaRunner.Runner.constants.EVENT_TEST_RETRY,
		], this.instance);
		this.runner.on(this.runner.constructor.events.EVENT_SUITE_PREPARED, () => {
			this.suites.pop();
		});
		this.runner.on(this.runner.constructor.events.TEST_FAILED, (test) => {
			this.result(test, Test.states.FAILED);
		});
		this.runner.on(this.runner.constructor.events.TEST_SUCCEEDED, (test) => {
			this.result(test, Test.states.PASSED);
		});
		this.runner.on(this.runner.constructor.events.TEST_PENDING, (test) => {
			this.result(test, Test.states.PENDING);
		})
	}

	/**
	 * @description
	 * Creates mocha suite
	 * @override
	 * @see Driver
	 * @returns {External}
	 */
	suite = (title, inst) => {
		const suite = MochaRunner.Suite.create(this.suites[this.suites.length - 1], title);
		this._bind(inst, suite);
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
	test = (title, fn, inst) => {
		const test = new MochaRunner.Test(title, fn);
		this._bind(inst, test);
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

	/**
	 * @override
	 * @see Driver
	 */
	result = (test, state) => {
		const inst = test[this.constructor.drivenKey];
		if (!inst) {
			this.emit(this.constructor.events.EVENT_UNDETECTED_ENTITY, test.title, state)
		} else {
			inst.state = state;
		}
	};

	run = () => {
		global.run();
	};

};

module.exports = Mocha;