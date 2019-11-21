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
	 * @type {boolean}
	 */
	seeded = false;
	/**
	 * @type {Array.<Function>}
	 */
	emergeBlocks = [];
	/**
	 * @private
	 * @typedef R
	 * @property {string} title - Runnable title
	 * @property {Function} fn - Runnable function
	 * @property {boolean} suite - Is runnable suite
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
	 * @returns {Seed} seed - Created seed
	 */
	seed = (title, fn) => {
		const seed = new Seed({fn, name: title, context: this.context, suite: this});
		this.seeds.push(seed);
		return seed;
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
	 */
	_suite = (title, fn) => {
		this._runnables.push({title, fn, suite: true});
	};

	/**
	 * @description
	 * Saves test details for further creation
	 * @param {string} title - Test title
	 * @param {Function} fn - Test function
	 */
	_test = (title, fn) => {
		this._runnables.push({title, fn, suite: false});
	};

	/**
	 * @description
	 * Creates suites and tests from stores data
	 */
	prepare = () => {
		for (const runnable of this._runnables)
			if (runnable.suite)
				super.suite(runnable.title, runnable.fn) ;
			else
				super.test(runnable.title, runnable.fn);
	};

	/**
	 * @description
	 * Runs all seeds synchronous (one by one)
	 * @async
	 */
	runSeeds = async () => {
		await this.runHook(this.constructor.hooks.BEFORE_SEEDS)
			.then(this._onHookSuccess)
			.catch(err => this._onHookFail(this.constructor.hooks.BEFORE_SEED, err));
		for (const seed of this.seeds) {
			const res = await this.runSeed(seed);
			if (!res) break;
		}
		this.seeded = true;
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
		return this.config.behavior === this.constructor.behaviour.CONTINUE;
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
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1,
		mode: this.mode.INTERRUPT_SUITE,
		behavior: this.behaviour.INTERRUPT
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

Suite.events.SEED_BEGIN = 'seedBegin';
Suite.events.SEED_END = 'seedEnd';
Suite.events.SEED_FAILED = 'seedFailed';
Suite.events.SEED_SUCCEEDED = 'seedSucceeded';

module.exports = Suite;