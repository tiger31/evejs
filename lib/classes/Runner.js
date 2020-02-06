const Suite = require('./Suite');
const Test = require('./Test');
const Reporter = require('./abstract/Reporter');
const Stateful = require('./mixins/Stateful');
const errors = require('../errors');
const glob = require('glob');
const fs = require('fs');
const utils = require('../utils');
const Promise = require('bluebird');

/**
 * @class
 * @augments Suite
 * @mixes Stateful
 */
const Runner = class Runner extends Stateful(Suite) {
	/**
	 * @type {object}
	 */
	context = {};
	/**
	 * @type {Reporter}
	 */
	reporter;
	/**
	 * @type {Array.<string>}
	 */
	files = [];
	/**
	 * @description
	 * Array with collected unhandled rejections
	 * @type {Array.<Error>}
	 * @private
	 */
	_unhandled = [];
	/**
	 * @description
	 * Collected run result
	 * @type {object}
	 */
	result;

	/**
	 * @param {object} [config] - Runner configuration
	 * @param {Reporter} [config.reporter] - Reporter
	 * @param {object} [config.test] - Runner tests configuration
	 * @param {string} [config.test.dir='tests'] - Default tests directory
	 * @param {string} [config.test.patten='*.test.js'] - Tests files pattern
	 * @param {object} [config.filters] - Runner filters
	 * @param {string|Array.<string>} [config.filter.scope=this.constructor.filters.ALL] - Runner scope[s]
	 * @param {string} [config.filters.epic=null] - Epic to run
	 * @param {string} [config.filters.feature=null] - Feature to tun
	 * @param {string} [config.filters.story=null] - Story to run
	 */
	/* eslint-disable-next-line max-lines-per-function */
	constructor(config = {}) {
		// noinspection JSCheckFunctionSignatures
		super({name: config.name || 'Runner', fn: () => {}}, config, false);
		//Resetting runner consistence
		global[this.constructor.consistenceProperty] = {};
		if (!this.config.reporter || !(this.config.reporter.prototype instanceof Reporter || this.config.reporter === Reporter))
			throw new TypeError('Reporter should be instance of Reporter');
		this.reporter = new this.config.reporter(this);
		this.runner = this; //Backwards compatibility with Suite class
		//Force to array form
		for (const key of Object.keys(this.config.filters))
			if (this.config.filters[key] && !(this.config.filters[key] instanceof Array))
				this.config.filters[key] = [ this.config.filters[key] ];

		//Setting custom getter
		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						suite: this.suite,
						test: this.test,
					},
					runtime: {
						scope: this.scope,
						Suite: {
							mode: Suite.mode,
							behaviour: Suite.behaviour
						}
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});

		this.state('init', this.init);
		this.state('prepare', this.prepare);
		this.state('framework', this.framework);
		this.state('error', this.error);
		this.state('emerge', this.finish);
		this.state('exit', this.exit);
		this.enter('init');
		//Uncaught error;
		global.process.on('uncaughtException', this._onUnhandled);
		global.process.on('unhandledRejection', (err) => {
			if (err instanceof errors.MIError && !(err instanceof errors.MINotPassed))
				console.log(`${err.name}: ${err.message} ${err.stack}`);
			else if (err instanceof errors.MINotPassed)
				console.log(err.message);
			else return this._onUnhandled(err);
			global.process.exit(1);
		});
	}

	/**
	 * @description
	 * Wraps code block in scope[s]
	 * @param {string|Array.<string>} scope - Scope
	 * @param {Function} fn - Function
	 * @throws {TypeError} - Scope not type of string
	 */
	scope = (scope, fn) => {
		const arr = (scope instanceof Array) ? scope : [ scope || Runner.scope.ALL ];
		if (!arr.every(e => typeof e === 'string'))
			throw new TypeError('Each passed scope should be a string');
		if ( //Run fn if
			this.config.filters.scope.includes(this.constructor.scope.ALL) //Global scope is ALL
			|| arr.includes(this.constructor.scope.ALL)  //Nested scope runs in ALL
			|| arr.some(e => this.config.filters.scope.includes(e)) //Nested scope has entry from global scope config
		) {
			fn && fn();
		}
	};

	/**
	 * @description
	 * Filters entities
	 * @param {object} params - Filter params
	 * @param {string} [params.epic] - Epic
	 * @param {string} [params.feature] - Feature
	 * @param {string} [params.story] - Story
	 * @param {string|Array.<string>} [params.scope] - Scope
	 * @param {object} parent - Parent's filter config
	 * @param {Function} fn - Function
	 * @param {boolean} [full=false] - Does null accepted as ok
	 * @example
	 * If configs are:
	 * runner filter = { story: "Story 1" }
	 * runnable config = { epic: "Epic", story: null}
	 * Such runnable will be accepted if full = false and won't if full = true
	 */
	filter = (params = {}, parent, fn, full = false) => {
		/* I don't prefer reassigning myself, but here it's the easiest way to inherit filter params */
		/* eslint-disable-next-line no-param-reassign */
		params = this.constructor._inherit(params, parent);
		for (const param of this.constructor.filters) {
			if (this.config.filters[param]) {
				if ((params[param] || full) && !this.config.filters[param].includes(params[param])) {
					return;
				}
			}
		}
		// noinspection JSUnresolvedVariable
		this.scope(params.scope, fn);
	};

	/**
	 * @param {object} child - Child params
	 * @param {object} parent - Parent params
	 * @throws errors.MITestsTreeError
	 * @returns {object.<string,*>} result
	 * @static
	 * @private
	 */
	static _inherit(child, parent) {
		const conf = {
			parent: this.filters.map(f => parent[f]),
			child: this.filters.map(f => child[f]),
		};
		const index = conf.parent.reduce((p, c, i) => { return (c) ? i : p; }, -1) + 1;
		for (let i = 0; i < this.filters.length; i++) {
			/*
									parent | child
				epic				'a'			'a'			(can't be rewritten, should throw err if different from parent)
				feature			null		null		(can be rewritten) <-- index = 1
				story				null		'c'    	(can be rewritten)
			 */
			if (i < index) {
				if (conf.child[i] && conf.child[i] !== conf.parent[i])
					throw new errors.MITestsTreeError(this.filters[i], conf.child[i], conf.parent[i]);
				conf.child[i] = conf.parent[i];
			}
		}
		return Object.assign(child, conf.child.reduce((o, c, i) => { o[this.filters[i]] = c; return o; }, {}));
	}

	/**
	 * @description
	 * Handles unhandled rejection
	 * @param {Error} error - Error
	 */
	_onUnhandled = (error) => {
		this._unhandled.push(error);
		this.emit(this.constructor.events.EVENT_UNHANDLED_REJECTION, error);
	};

	/**
	 * @override
	 * @description
	 * Initializes runner
	 */
	init = () => {
		this.emit(this.constructor.events.EVENT_STATE_INIT_BEGIN);
		this.emit(this.constructor.events.EVENT_EXPORT_SETUP);
		try {
			this.includeTestFiles();
		} catch (error) {
			return this.next('error', error, false);
		}
		this.emit(this.constructor.events.EVENT_EXPORT_TEARDOWN);
		//Exporting runtime functions
		this.emit(this.constructor.events.EVENT_EXPORT_SETUP, 'runtime');
		this.emit(this.constructor.events.EVENT_STATE_INIT_END);
	};

	/**
	 * @description
	 * Prepares every Suite
	 * "Prepares" means each suite builds test tree with test suites and tests itself
	 * @override
	 * @returns {*} - Closes current state and jumps to next
	 */
	prepare = () => {
		this.emit(this.constructor.events.EVENT_STATE_PREPARE_BEGIN);
		this.runnables = this.MISuites.filter(s => s.config.mode === Suite.mode.ALLOW_TO_FAIL
			|| s.seeded === Suite.seedingStatus.SUCCEEDED);
		if (this.runnables.length === 0)
			return this.next('emerge');
		try {
			this.runnables.forEach(suite => suite.prepare());
		} catch (error) {
			return this.next('error', (error instanceof errors.MIError) ? error : new errors.MIRunnerError(error))
		}
		this.emit(this.constructor.events.EVENT_STATE_PREPARE_END);
		if (!this.MISuites.some(s => s.runnables.length > 0))
			return this.next('emerge');
		return this.next('framework');
	};

	framework = () => {
		this.emit(this.constructor.events.EVENT_STATE_FRAMEWORK_BEGIN);
		return super.run().then(() => {
			return Promise.try(() => {
				return this.analysis()
			}).then(() => {
				return this.next('emerge');
			}).catch((err) => {
				return this.next('error', err);
			}).finally((a) => {
				this.emit(this.constructor.events.EVENT_STATE_FRAMEWORK_END);
			})
		});
	};

	/**
	 * @description
	 * Analyses tests tree after framework end
	 */
	analysis = () => {
		const failed = [];
		/**
		 * @external TestSuite
		 * @description
		 * Returns failed tests in suite
		 * @param {TestSuite} suite - Tests suite
		 */
		const getFailed = (suite) => {
			for (const test of suite.tests)
				if (test.state === Test.states.FAILED)
					failed.push(test);
			suite.suites.forEach(getFailed);
		};

		this.runnables.forEach(getFailed);
		if (failed.length > 0)
			throw new errors.MINotPassed(failed);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	run = () => {
		 return this.enter('framework');
	};

	/**
	 * @description
	 * Finds and requires test files
	 * @private
	 */
	includeTestFiles = () => {
		const pwd = global.process.cwd();
		if (!fs.existsSync(this.config.test.dir)) {
			throw new ReferenceError(`Tests directory "${this.config.test.dir}" does not exist`);
		} else {
			const pattern = `${pwd}/${this.config.test.dir}/${this.config.test.pattern}`;
			const files = glob.sync(pattern);
			// noinspection JSUnresolvedFunction
			files.forEach((file) => {
				this.emit(this.constructor.events.EVENT_INIT_FILE_REQUIRE, file);
				require(file);
			});
			this.files = files;
		}
	};

	/**
	 * @description
	 * Unloads required files
	 */
	unloadTestFiles = () => {
		for (const file of this.files)
			delete require.cache[require.resolve(file)];
	};

	/**
	 * @private
	 * @param {string|Error} error - Error
	 * @param {boolean} emerge - Does emerge state needed
	 * @returns {*} - Closes current state and jumps to emerge state
	 */
	error = (error, emerge = true) => {
		this.emit(this.constructor.events.EVENT_STATE_ERROR, error);
		return this.next((emerge) ? 'emerge' : 'exit', error);
	};

	/**
	 * @description
	 * Runs emerge state
	 * @param {string|Error} error - Error passed from error state if there were some error
	 * @returns {*} - Closes current state and jumps to exit state
	 */
	//TODO remove emerge state
	finish = (error) => {
		this.emit(this.constructor.events.EVENT_STATE_EMERGE_BEGIN);
		this.emit(this.constructor.events.EVENT_STATE_EMERGE_END);
		return this.next('exit', error);
	};

	/**
	 * @description
	 * Throws err that kills runner process
	 * @param {string|Error} [error] - Exit message
	 * @private
	 * @throws {Error}
	 */
	exit = (error) => {
		this.emit(this.constructor.events.EVENT_EXPORT_TEARDOWN, 'runtime');
		this.emit(this.constructor.events.EVENT_STATE_EXIT);
		global[this.constructor.consistenceProperty] = {};
		this.destroy();
		try {
			this.result = this.collect(error);
		} catch (e) {
			console.log(e)
		}
		console.log(JSON.stringify(this.result));
		if (error)
			throw (error instanceof Error) ? error : new errors.MIRunnerError(error);
	};

	/**
	 * @override
	 * @see Collectable
	 * @param {Error|string?} error - Error
	 */
	collect = (error) => { //TODO config
		return {
			id: this._collectable_uuid,
			name: this.name,
			suites: this.MISuites.map(r => r.collect()),
			error: JSON.stringify((error) ? utils.errorToOj(error) : null),
			errors: JSON.stringify(this.errors.map(e => utils.errorToOj(e))),
			config: JSON.stringify({
				test: this.config.test,
				allowUndetected: this.config.allowUndetected,
			}),
			fatal: error && !(error instanceof errors.MINotPassed),
			filter: this.config.filters
		}
	};

	/**
	 * @description
	 * Default scope
	 * @enum
	 * @type {object.<string, string>}
	 * @static
	 */
	static scope = {
		ALL: 'all'
	};

	/**
	 * @description
	 * Suite/Seed/TestSuite/Test config keys that are part of filtering
	 * @type {Array.<string>}
	 * @static
	 */
	static filters = [ 'epic', 'feature', 'story' ];

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1,
		reporter: Reporter,
		allowUndetected: true,
		//Driver default configs
		filters: {
			scope: this.scope.ALL,
			epic: null,
			feature: null,
			story: null,
		},
		test: {
			dir: 'tests',
			pattern: '*.test.js',
		},
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static _deep = [
		'test',
		'filters',
	];

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Runner';
};


//States events
Runner.events.EVENT_STATE_INIT_BEGIN = 'stateInitBegin';
Runner.events.EVENT_STATE_INIT_END = 'stateInitEnd';
Runner.events.EVENT_STATE_SEEDING_BEGIN = 'stateSeedingBegin';
Runner.events.EVENT_STATE_SEEDING_END = 'stateSeedingEnd';
Runner.events.EVENT_STATE_PREPARE_BEGIN = 'statePrepareBegin';
Runner.events.EVENT_STATE_PREPARE_END = 'statePrepareEnd';
Runner.events.EVENT_STATE_FRAMEWORK_BEGIN = 'stateFrameworkBegin';
Runner.events.EVENT_STATE_FRAMEWORK_END = 'stateFrameworkEnd';
Runner.events.EVENT_STATE_EMERGE_BEGIN = 'stateEmergeBegin';
Runner.events.EVENT_STATE_EMERGE_END = 'stateEmergeEnd';
Runner.events.EVENT_STATE_ERROR = 'stateError';
Runner.events.EVENT_STATE_EXIT = 'stateExit';
//Init phase events
Runner.events.EVENT_INIT_FILE_REQUIRE = 'initFileRequire';
//Framework phase events
Runner.events.EVENT_FRAMEWORK_UNDETECTED_ENTITY = 'frameworkUndetectedEntity';
//Unhandled rejection
Runner.events.EVENT_UNHANDLED_REJECTION = 'unhandledRejection';

Runner.events.SUITE_BEGIN = 'suiteBegin';
Runner.events.SUITE_END = 'suiteEnd';
Runner.events.TEST_BEGIN = 'testBegin';
Runner.events.TEST_END = 'testEnd';
Runner.events.TEST_FAILED = 'testFailed';
Runner.events.TEST_SUCCEEDED = 'testSucceeded';
Runner.events.TEST_PENDING = 'testPending';

module.exports = Runner;
