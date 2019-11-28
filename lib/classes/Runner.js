const Suite = require('./Suite');
const Mocha = require('./drivers/Mocha');
const Reporter = require('./abstract/Reporter');
const errors = require('../errors');
const glob = require('glob');
const fs = require('fs');

/**
 * @class
 * @augments Suite
 * @mixes Hooked
 */
const Runner = class Runner extends Suite {
	/**
	 * @type {object}
	 */
	context = {};
	/**
	 * @type {Array.<Suite>}
	 */
	MISuites = [];
	/**
	 * @external Driver
	 * @type {Driver}
	 */
	driver;
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
	 * Controls framework execution
	 * @type {Promise}
	 */
	framework;

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
	constructor(config) {
		// noinspection JSCheckFunctionSignatures
		super({name: 'Root'}, config, false);
		this.driver = new this.config.driver({}, this);
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
						seed: this.seed,
						emerge: this.emerge,
						mi: this.mi,
					},
					runtime: {
						scope: this.scope,
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});

		this.init();
	}

	/**
	 * @description
	 * Creates new suite
	 * @param {string} title - Suite title
	 * @param {Function} fn - Suite function
	 * @param {object} config - Config object
	 */
	mi = (title, fn, config = {}) => {
		this.filter(config, {},() => {
			const suite = new Suite({fn, name: title, runner: this}, config);
			this.MISuites.push(suite);
			//Proxy events from suites on runner emitter
			this.proxy([
				this.constructor.events.SEED_END,
				this.constructor.events.SEED_BEGIN,
				this.constructor.events.SEED_FAILED,
				this.constructor.events.SEED_SUCCEEDED,
				this.constructor.events.SUITE_BEGIN,
				this.constructor.events.SUITE_END,
				this.constructor.events.TEST_BEGIN,
				this.constructor.events.TEST_END,
				this.constructor.events.TEST_FAILED,
				this.constructor.events.TEST_SUCCEEDED,
				this.constructor.events.EVENT_HOOK_FAILED,
				this.constructor.events.EVENT_HOOK_SUCCEEDED,
				this.constructor.events.EVENT_SUITE_PREPARED,
			], suite);
		});
	};

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
	 * @override
	 * @description
	 * Initializes runner
	 */
	init = () => {
		this.emit(this.constructor.events.EVENT_EXPORT_SETUP);
		this.includeTestFiles();
		this.emit(this.constructor.events.EVENT_EXPORT_TEARDOWN);
		//Exporting runtime functions
		this.emit(this.constructor.events.EVENT_EXPORT_SETUP, 'runtime');
	};

	/**
	 * @description
	 * Prepares every Suite
	 * "Prepares" means each suite builds test tree with test suites and tests itself
	 * @override
	 */
	prepare = () => {
		try {
			this.MISuites.forEach(suite => suite.prepare());
		} catch (error) {
			this.error(error);
		}
	};

	/**
	 * @override
	 *
	 */
	run = async () => {
		//[STAGE 1] Seeding
		this.reporter.seeding();
		await this.runSeeds();
		if (this.seeded !== this.constructor.seedingStatus.SUCCEEDED)
			this.error('Runner seeding failed');
		await Promise.all(this.MISuites.map(suite => suite.runSeeds()));
		if (this.MISuites.some(s => s.config.mode === Suite.mode.INTERRUPT_RUN && s.seeded === Suite.seedingStatus.FAILED))
			this.error('Suite seeding failed (See flag RUN_INTERRUPT)');
		//[STAGE 2] Preparing tests
		this.prepare();
		//TODO Ordering
		this.runnables = this.MISuites.filter(s => s.config.mode === Suite.mode.ALLOW_TO_FAIL || s.seeded === Suite.seedingStatus.SUCCEEDED);
		for (const suite of this.runnables)
			await suite.run();
		//[STAGE 3] Running tests
		this.driver.run();
		await this.framework.catch(this.error);
		//[STAGE 4] Running emerges
		this.exit();
	};

	/**
	 * @description
	 * Finds and requires test files
	 * @private
	 */
	includeTestFiles = () => {
		const pwd = global.process.cwd();
		if (!fs.existsSync(this.config.test.dir)) {
			this.error(`Tests directory "${this.config.test.dir}" does not exists`);
		} else {
			try {
				const pattern = `${pwd}/${this.config.test.dir}/${this.config.test.pattern}`;
				const files = glob.sync(pattern);
				// noinspection JSUnresolvedFunction
				files.forEach(file => require(file));
				this.files = files;
			} catch (error) {
				this.error(error);
			}
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
	 */
	error = (error) => {
		//TODO log error
		// noinspection JSIgnoredPromiseFromCall
		this.exit(error);
	};

	/**
	 * @description
	 * Throws err that kills runner process
	 * @param {string|Error} [error] - Exit message
	 * @private
	 * @throws {Error}
	 */
	exit = (error) => {
		// noinspection JSUnresolvedFunction
		this.emit(this.constructor.events.EVENT_EXPORT_TEARDOWN, 'runtime');
		// noinspection JSUnresolvedFunction
		this.destroy();
		//TODO sync with server
		this.runEmerges().then(() => Promise.all(this.MISuites.map(s => s.runEmerges())));
		if (error)
			throw (error instanceof Error) ? error : new errors.MIRunnerError(error);
	};

	/**
	 * @description
	 * Runner drivers list
	 * @static
	 * @type {object.<string, Driver>}
	 * @enum
	 */
	static drivers = {
		mocha: Mocha
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
		mode: this.mode.INTERRUPT_RUN,
		behaviour: this.behaviour.INTERRUPT,
		driver: this.drivers.mocha,
		reporter: Reporter,
		filters: {
			scope: this.scope.ALL,
			epic: null,
			feature: null,
			story: null,
		},
		test: {
			dir: 'tests',
			recursive: true,
			pattern: '*.test.js',
		}
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static _deep = [
		'test',
		'filters'
	];
};

Runner.events.SUITE_BEGIN = 'suiteBegin';
Runner.events.SUITE_END = 'suiteEnd';
Runner.events.TEST_BEGIN = 'testBegin';
Runner.events.TEST_END = 'testEnd';
Runner.events.TEST_FAILED = 'testFailed';
Runner.events.TEST_SUCCEEDED = 'testSucceeded';
Runner.events.TEST_PENDING = 'testPending';

module.exports = Runner;