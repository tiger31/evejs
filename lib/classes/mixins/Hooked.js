const Hook = require('../abstract/Hook');
const errors = require('../../errors');

const Hooked = (Base) => {
	// noinspection UnnecessaryLocalVariableJS
	/**
	 * @mixin Hooked
	 */
	const temp = class extends Base {
		/**
		 * @type {object.<string, {export: Function, hook: Hook}>}
		 */
		hooks = {};

		/**
		 * @param {*} args - Constructor args
		 */
		constructor(...args) {
			super(...args);
		}

		/**
		 * @description
		 * Registers hook on this runnable
		 * @param {string} title - Hook name
		 * @param {Function} fn - Hook function
		 * @param {object} config - Hook config
		 * @throws errors.MIHookNotFound
		 * @returns {Hook} hook
		 */
		registerHook(title, fn, config) {
			if (!Object.values(this.constructor.hooks).includes(title))
				throw new errors.MIHookNotFound(this, title);
			this.hooks[title].hook = new Hook({fn, name: title, context: this.context}, config);
			return this.hooks[title].hook;
		}

		/**
		 * @description
		 * Registers all hooks defined in static property "hooks" on instance
		 */
		defineHooks() {
			for (const hook of Object.values(this.constructor.hooks)) {
				this.hooks[hook] = {
					export: (fn, config) => this.registerHook(hook, fn, config),
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
		 * @throws {TypeError} - Hook is not instance of hook
		 * @throws {errors.MIHookNotFound} - Hook not found
		 * @throws {Error} - Error in hook runtime
		 * @returns {*} any - Hook output
		 */
		runHook(name, ...args) {
			if (this.hooks[name]) {
				if (this.hooks[name].hook instanceof Hook) {
					this.emit(name, this, ...args);
					return this.hooks[name].hook.run();
				} else throw new TypeError('Runnable hooks should be instance of Hook');
			} else throw new errors.MIHookNotFound(this, name);
		}


		/**
		 * @enum
		 * @static
		 * @type {object.<string, string>}
		 */
		static hooks = {};
	};
	//Define new events
	temp.events.EVENT_HOOK_FAILED = 'hookFailed';
	temp.events.EVENT_HOOK_SUCCEEDED = 'hookSucceeded';

	return temp;
};

module.exports = Hooked;