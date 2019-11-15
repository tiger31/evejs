const HookedRunnable = require('./abstract/HookedRunnable');
const Seeder = require('./mixins/Seeder');
const errors = require('../errors');

/**
 * @mixes Seeder
 * @extends HookedRunnable
 * @type {Suite}
 */
const Suite = class Suite extends Seeder(HookedRunnable) {
	initialized = false;
	/**
	 * @description
	 * Function that contains tests
	 * @type {Function}
	 */
	test;
	/**
	 * @constructor
	 * @extends HookRunnable
	 * @see HookRunnable
	 * @param args
	 * @param config
	 * @param args.runner - MI Runner instance
	 */
	constructor({fn, name, runner} = {}, config) {
		super({fn, name}, config);
		this.name = name;
		this.runner = runner;
		//Setting custom getter
		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						seed: this.seed,
						main: this.main,
						emerge: this.emerge
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});

		this.run();
	}

	/**
	 * @description
	 * Creates main test block
	 * @param {Function} fn
	 * @param {Object} config
	 */
	main = (fn, /* config */) => {
		//TODO config
		this.test = fn;
	};

	/**
	 * @description
	 * Runs test function (main block)
	 * Function do not actually runs tests, because test run is delayed
	 */
	runTests = async () => {
		await this.runHook(this.constructor.hooks.BEFORE_TEST, this);
		try {
			this.test(this.context);
		} catch (error) {
			this.errors.push(error);
			await this.runHook(this.constructor.hooks.AFTER_TEST, this);
			throw new errors.MIFrameworkError(error);
		}
		await this.runHook(this.constructor.hooks.AFTER_TEST, this);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	run = () => {
		this.emit(this.constructor.events.EVENT_RUNNABLE_BEGIN);
		try {
			this.fn();
			this.initialized = true;
		} catch (error) {
			this.errors.push(error);
		}
		this.emit(this.constructor.events.EVENT_RUNNABLE_END);
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1, //Timeout removed
		mode: this.mode.INTERRUPT_SUITE,
		behavior: this.behaviour.INTERRUPT
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Suite';
};

/**
 * @override
 * @static
 * @see HookRunnable
 */
Suite.hooks.BEFORE_TEST = 'beforeTest';
Suite.hooks.AFTER_TEST = 'afterTest';

module.exports = Suite;