const Hook = require('../abstract/Hook');
const errors = require('../../errors');

const Hooked = (Base) => {
	// noinspection UnnecessaryLocalVariableJS
	/**
	 * @mixin Hooked
 	 */
	const temp = class extends Base {
		/**
		 * @type {Object.<string, {export: Function, hook: Hook}>}
		 */
		hooks = {};

		/**
		 * @param args
		 */
		constructor(...args) {
			super(...args);
		}

		/**
		 * @description
		 * Registers hook on this runnable
		 * @param {Function} fn - Hook function
		 * @param {string} title - Hook name
		 * @throws errors.MIHookNotFound
		 * @return {Hook} hook
		 */
		registerHook(title, fn) {
			if (!Object.values(this.constructor.hooks).includes(title))
				throw new errors.MIHookNotFound(this, title);
			this.hooks[title].hook = new Hook({fn, name: title, context: this.context});
			return this.hooks[title].hook;
		}

		/**
		 * @description
		 * Registers all hooks defined in static property "hooks" on instance
		 */
		defineHooks() {
			for (const hook of Object.values(this.constructor.hooks)) {
				this.hooks[hook] = {
					export: fn => this.registerHook(hook, fn),
					hook: new Hook({fn: () => {}, name: hook, context: this.context})
				};
			}
		}

		/**
		 * @description
		 * Triggers event with hooks name, and runs hook
		 * @async
		 * @param {string} name - Hook name
		 * @param {...*} args - Event args
		 */
		async runHook(name, ...args) {
			if (this.hooks[name]) {
				if (this.hooks[name].hook instanceof Hook) {
					this.emit(name, this, ...args);
					await this.hooks[name].hook.run();
				} else throw new TypeError('Runnable hooks should be instance of Hook');
			} else throw new errors.MIHookNotFound(this, name);
		}

		/**
		 * @enum
		 * @static
		 * @type {Object.<string, string>}
		 */
		static hooks = {};
	};

	return temp;
};

module.exports = Hooked;