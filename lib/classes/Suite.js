const TestSuite = require('./TestSuite');
const Seed = require('./Seed');
///const errors = require('../errors');

/**
 * @augments TestSuite
 * @type {Suite}
 */
const Suite = class Suite extends TestSuite {
	context = {};
	/**
	 * @type {Array.<Seed>}
	 */
	seeds = [];
	/**
	 * @type {number}
	 */
	seeded;
	/**
	 * @type {Array.<Function>}
	 */
	emergeBlocks = [];
	/**
	 * @type {boolean}
	 */
	prepared = false;
	/**
	 * @private
	 * @typedef R
	 * @property {string} title - Runnable title
	 * @property {Function} fn - Runnable function
	 * @property {boolean} suite - Is runnable suite
	 * @property {object} config - Runnable config
	 * @type {Array.<R>}
	 */
	_runnables = [];

	/**
	 * @external Runner
	 * @see TestSuite
	 * @param {object} args - TestSuite args
	 * @param {Runner} args.runner - MI Runner instance
	 * @param {object} config - Suite config object
	 * @param {boolean} [init=true] - Pre-initialized. If true, runs main function in constructor to initialize nested entities
	 */
	constructor({fn, name, runner} = {}, config, init = true) {
		super({fn, name, runner}, config, false);
		this.seeded = this.constructor.seedingStatus.NOT_STARTED;
		//Setting custom getter
		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						suite: this._suite,
						test: this._test,
						seed: this.seed,
						emerge: this.emerge,
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});

		if (init)
			this.init();
	}

	/**
	 * @description
	 * Creates new Seed. Exported into global space
	 * @param {string} title - Seed name
	 * @param {Function} fn - Seed main function
	 * @param {object} config - Seed config
	 */
	seed = (title, fn, config = {}) => {
		this.runner.filter(config, this.config,  () => {
			const seed = new Seed({fn, name: title, context: this.context, suite: this}, config);
			this.seeds.push(seed);
		}, true);
	};

	/**
	 * @description
	 * Registers new emerge block
	 * @param {Function} fn - Emerge function
	 */
	emerge = (fn) => {
		if (!(fn instanceof Function))
			throw new TypeError('Emerge block should be a function');
		this.emergeBlocks.push(fn);
	};

	/**
	 * @description
	 * Saves suite details for further creation
	 * @param {string} title - Suite title
	 * @param {Function} fn - Suite function
	 * @param {object} config - Suite config
	 */
	_suite = (title, fn, config) => {
		this._runnables.push({title, fn, suite: true, config});
	};

	/**
	 * @description
	 * Saves test details for further creation
	 * @param {string} title - Test title
	 * @param {Function} fn - Test function
	 * @param {object} config - Test config
	 */
	_test = (title, fn, config) => {
		this._runnables.push({title, fn, suite: false, config});
	};

	/**
	 * @description
	 * Creates suites and tests from stores data
	 * Suites with failed seeds won't run depends on it's mode
	 */
	prepare = () => {
		if (this.seeded !== this.constructor.seedingStatus.SUCCEEDED && this.config.mode !== Suite.mode.ALLOW_TO_FAIL) return;
		for (const runnable of this._runnables)
			if (runnable.suite)
				this.suite(runnable.title, runnable.fn, runnable.config);
			else
				this.test(runnable.title, runnable.fn, runnable.config);
		this.prepared = true;
	};

	/**
	 * @description
	 * Runs all seeds synchronous (one by one)
	 * @async
	 */
	runSeeds = async () => {
		this._state(this.constructor.seedingStatus.IN_PROGRESS);
		await this.runHook(this.constructor.hooks.BEFORE_SEEDS)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_SEED, err));
		for (const seed of this.seeds) {
			const res = await this.runSeed(seed);
			if (!res) {
				this._state(this.constructor.seedingStatus.FAILED);
				break;
			}
		}
		if (this.seeded !== this.constructor.seedingStatus.FAILED)
			this._state(this.constructor.seedingStatus.SUCCEEDED);
		await this.runHook(this.constructor.hooks.AFTER_SEEDS)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_SEED, err));
	};

	/**
	 * @description
	 * Runs single seed with hooks
	 * @param {Seed} seed - Seed
	 * @returns {boolean} continue
	 */
	runSeed = async (seed) => {
		await this.runHook(this.constructor.hooks.BEFORE_SEED)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_SEED, err));
		this.emit(this.constructor.events.SEED_BEGIN, this, seed);
		const res = await seed.run()
			.then(() => this._onSeedSuccess(seed))
			.catch(err => this._onSeedFail(seed, err));
		this.emit(this.constructor.events.SEED_END, this, seed);
		await this.runHook(this.constructor.hooks.AFTER_SEED)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.AFTER_SEED, err));
		return res;
	};

	/**
	 * @description
	 * Handles Seed fail
	 * @param {Seed} seed - Seed
	 * @param {Error} error - Error
	 * @returns {boolean} continueSeeding
	 * @protected
	 */
	_onSeedFail = (seed, error) => {
		this.errors.push(error);
		this.emit(this.constructor.events.SEED_FAILED, this, seed, error);
		return this.config.behaviour === this.constructor.behaviour.CONTINUE;
	};

	/**
	 * @description
	 * Handles Seed success
	 * @param {Seed} seed - Seed
	 * @returns {boolean} true - If succeeded continue seeding
	 * @protected
	 */
	_onSeedSuccess = (seed) => {
		this.emit(this.constructor.events.SEED_SUCCEEDED, this, seed);
		return true;
	};

	/**
	 * @description
	 * Sets seeding state of suite
	 * @param {number} status - Seeding status
	 * @private
	 */
	_state = (status) => {
		this.seeded = status;
		this.emit(this.constructor.events.SEEDING_STATUS_CHANGED, this, status);
	};

	/**
	 * @description
	 * Runs emerge blocks
	 */
	runEmerges = async () => {
		for (const emerge of this.emergeBlocks)
			try {
				await emerge();
			} catch (error) {
				this.errors.push(error);
			}
	};


	/**
	 * @description
	 * Seeds running mode
	 * - ALLOW_TO_FAIL - Suite tests will run even if one or all seeds failed
	 * - INTERRUPT_SUITE - Suite tests won't run if one of seeds failed
	 * - INTERRUPT_RUN - If one of seeds fails cancels whole test run
	 * @enum
	 */
	static mode = {
		ALLOW_TO_FAIL: 0,
		INTERRUPT_SUITE: 1,
		INTERRUPT_RUN: 2
	};

	/**
	 * @description
	 * Seeds behaviour on fail
	 * - CONTINUE - Runs next seed event if previous failed
	 * - INTERRUPT - Interrupts seeding for current suite
	 */
	static behaviour = {
		CONTINUE: 0,
		INTERRUPT: 1
	};

	/**
	 * @see Seed
	 */
	static seedingStatus = Seed.status;

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1,
		mode: this.mode.INTERRUPT_SUITE,
		behaviour: this.behaviour.INTERRUPT,
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Suite';

	/**
	 * @override
	 * @see Runnable
	 */
	static nested = false;
};

Suite.hooks.BEFORE_SEEDS = 'beforeSeeds';
Suite.hooks.BEFORE_SEED = 'beforeSeed';
Suite.hooks.AFTER_SEEDS = 'afterSeeds';
Suite.hooks.AFTER_SEED = 'afterSeed';

Suite.events.SEEDING_STATUS_CHANGED = 'seedingStatus';
Suite.events.SEED_BEGIN = 'seedBegin';
Suite.events.SEED_END = 'seedEnd';
Suite.events.SEED_FAILED = 'seedFailed';
Suite.events.SEED_SUCCEEDED = 'seedSucceeded';

module.exports = Suite;