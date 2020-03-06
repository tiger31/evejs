const Suite = require('./Suite');
const Test = require('./Test');
const Reporter = require('./reporters/Base');
const Stateful = require('./mixins/Stateful');
const errors = require('../errors');
const glob = require('glob');
const fs = require('fs');
const Promise = require('bluebird');
const collector = require('../collectors').Run;


const reporters = {
	'default': Reporter
};

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
	//TODO runner config;

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
		super({title: config.title || 'Runner', fn: () => {}}, {}, false);
		this.config = Object.assign({}, this.constructor.default, config);

		//TODO Reported
		this.reporter = new reporters[this.config.reporter](this);
		this.runner = this; //Backwards compatibility with Suite class
		//Force to array form
		this.exports.runtime = {
			scope: this.scoped
		};

		this.collect(collector);

		this.state('init', this.init);
		this.state('framework', this.framework);
		this.state('error', this.error);
		this.state('exit', this.exit);
		this.enter('init');
		//Uncaught error;
		//TODO check
		global.process.on('uncaughtException', this._onUnhandled);
		global.process.on('unhandledRejection', (err) => {
			if (err instanceof errors.MIError && !(err instanceof errors.MINotPassed))
				console.log(`${err.name}: ${err.message} ${err.stack}`);
			else if (err instanceof errors.MINotPassed)
				console.log();
			else return this._onUnhandled(err);
			global.process.exit(1);
		});
	}

	/**
	 * @description
	 * Wraps code block in scope[s]
	 * @param {string|Array.<string>} scope - Scope
	 * @param {Function} fn - Function
	 * @param {*} args - Fn args
	 * @throws {TypeError} - Scope not type of string
	 */
	scoped = (scope, fn, ...args) => {
		const arr = (scope instanceof Array) ? scope : [ scope || Runner.scope.ALL ];
		if (!arr.every(e => typeof e === 'string'))
			throw new TypeError('Each passed scope should be type of string');
		if ( //Run fn if
			this.config.scope.includes(this.constructor.scope.ALL) //Global scope is ALL
			|| arr.includes(this.constructor.scope.ALL)  //Nested scope runs in ALL
			|| arr.some(e => this.scope.includes(e)) //Nested scope has entry from global scope config
		) {
			fn && fn(...args);
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
			if (this.config[param]) {
				if ((params[param] || full) && (!params[param] || !params[param].some(p => this.config[param].includes(p)))) {
					return;
				}
			}
		}
		// noinspection JSUnresolvedVariable
		this.scoped(params.scope, fn, params);
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
			parent: this.filters.map(f => parent[f] || parent.shadowed[f]),
			child: this.filters.map(f => (child[f] && !(child[f] instanceof Array)) ? [ child[f] ] : child[f]),
		};
		conf.child.shadowed = [];
		const index = conf.parent.reduce((p, c, i) => { return (c) ? i : p; }, -1) + 1;
		for (let i = 0; i < this.filters.length; i++) {
			/*
									parent | child
				epic				'a'			'a'			(can't be rewritten, should throw err if different from parent)
				feature			null		null		(can be rewritten) <-- index = 1
				story				null		'c'    	(can be rewritten)
			 */
			if (i < index) {
				if (conf.child[i] && conf.parent[i] && !conf.child[i].every(f => conf.parent[i].includes(f)))
					throw new errors.MITestsTreeError(this.filters[i], conf.child[i], conf.parent[i]);
				if (!conf.child[i] && conf.parent[i]) {
					conf.child.shadowed[i] = conf.parent[i];
				}
			}
		}

		const config = conf.child.reduce((o, c, i) => { o[this.filters[i]] = c; return o; }, {});
		config.shadowed = conf.child.shadowed.reduce((o, c, i) => { o[this.filters[i]] = c; return o; }, {});
		return Object.assign({}, child, config);
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
		this.export();
		try {
			this.includeFiles();
			this.includeTestFiles();
		} catch (error) {
			return this.next('error', error, false);
		}
		this.emit(this.constructor.events.EVENT_STATE_INIT_END);
	};

	framework = () => {
		this.emit(this.constructor.events.EVENT_STATE_FRAMEWORK_BEGIN);
		return super.run().then(() => {
			return Promise.try(() => {
				try {
					this.analysis();
					this.emit(this.constructor.events.EVENT_STATE_FRAMEWORK_END);
					return this.next('exit');
				} catch (err) {
					this.emit(this.constructor.events.EVENT_STATE_FRAMEWORK_END);
					return this.next('error', err);
				}
			});
		});
	};

	/**
	 * @description
	 * Analyses tests tree after framework end
	 */
	analysis = () => {
		if (this.stats.summary.tests[Test.states.FAILED] || this.stats.summary.tests[Test.states.FAILED])
			throw new errors.MINotPassed();
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
		if (!fs.existsSync(this.config.dir)) {
			throw new ReferenceError(`Tests directory "${this.config.dir}" does not exist`);
		} else {
			const pattern = `${pwd}/${this.config.dir}/${this.config.pattern}`;
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
	 * Requires files
	 */
	includeFiles = () => {
		const pwd = global.process.cwd();
		if (this.config.include.length > 0) {
			for (const file of this.config.include) {
				require(`${pwd}/${file}`);
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
	 * @returns {*} - Closes current state and jumps to emerge state
	 */
	error = (error) => {
		this.emit(this.constructor.events.EVENT_STATE_ERROR, error);
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
		this.emit(this.constructor.events.EVENT_STATE_EXIT);
		this.retain();
		if (error)
			throw (error instanceof Error) ? error : new errors.MIRunnerError(error);
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
		reporter: 'default',
		//Driver default configs
		scope: this.scope.ALL,
		epic: null,
		feature: null,
		story: null,
		dir: 'tests',
		pattern: '*.test.js',
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Runner';
};


//States events
Runner.events = {};
Runner.events.EVENT_STATE_INIT_BEGIN = 'stateInitBegin';
Runner.events.EVENT_STATE_INIT_END = 'stateInitEnd';
Runner.events.EVENT_STATE_PREPARE_BEGIN = 'statePrepareBegin';
Runner.events.EVENT_STATE_PREPARE_END = 'statePrepareEnd';
Runner.events.EVENT_STATE_FRAMEWORK_BEGIN = 'stateFrameworkBegin';
Runner.events.EVENT_STATE_FRAMEWORK_END = 'stateFrameworkEnd';
Runner.events.EVENT_STATE_ERROR = 'stateError';
Runner.events.EVENT_STATE_EXIT = 'stateExit';
//Init phase events
Runner.events.EVENT_INIT_FILE_REQUIRE = 'initFileRequire';
//Unhandled rejection
Runner.events.EVENT_UNHANDLED_REJECTION = 'unhandledRejection';

module.exports = Runner;
module.exports.reporters = Object.keys(reporters);
