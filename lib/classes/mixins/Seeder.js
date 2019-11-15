const Seed = require('../Seed');

const Seeder = (Base) => {
	/**
	 * @mixin Seeder
	 */
	const temp = class extends Base {
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
		// noinspection JSMismatchedCollectionQueryUpdate
		/**
		 * @type {Array.<Error>}
		 */
		errors = [];

		/**
		 * @constructor
		 * @param {...} props
		 */
		constructor(...props) {
			super(...props);
		}

		/**
		 * @description
		 * Creates new Seed. Exported into global space
		 * @param {Function} fn - Seed main function
		 * @param {string} title - Seed name
		 * @return {Seed}
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
		 * Runs all seeds synchronous (one by one)
		 * @async
		 */
		runSeeds = async () => {
			await this.runHook(this.constructor.hooks.BEFORE_SEEDS);
			for (const seed of this.seeds) {
				//Running hook before_seed
				await this.runHook(this.constructor.hooks.BEFORE_SEED, seed);
				let error;
				await seed.run().catch((err) => {
					error = err;
				});
				//Running hook after_seed
				await this.runHook(this.constructor.hooks.AFTER_SEED, seed);
				if (error) {
					this.errors.push(error);
					if (this.config.behavior !== this.constructor.behaviour.CONTINUE) break;
				}
			}
			this.seeded = true;
			await this.runHook(this.constructor.hooks.AFTER_SEEDS);
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
	};

	temp.default.mode = temp.mode.INTERRUPT_SUITE;
	temp.default.behavior = temp.behaviour.INTERRUPT;
	temp.default.timeout = -1;

	temp.hooks.BEFORE_SEEDS = 'beforeSeeds';
	temp.hooks.BEFORE_SEED = 'beforeSeed';
	temp.hooks.AFTER_SEEDS = 'afterSeeds';
	temp.hooks.AFTER_SEED = 'afterSeed';

	return temp;
};


module.exports = Seeder;