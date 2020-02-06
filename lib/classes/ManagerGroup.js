/**
 * @external Runnable
 * @description
 * Stores all runnables from single group
 * Provides iterator over them with hooks if it's allowed
 * @class
 */
module.exports = class ManagerGroup {
	/**
	 * @type {object}
	 * @property {string} before - Hook that runs before group execution
	 * @property {string} beforeEach - Hook that runs before execution of each group member
	 * @property {string} afterEach - Hook that runs after execution of each group member
	 * @property {string} after - Hook that runs after group execution
	 * @private
	 */
	_hooks = {};
	/**
	 * @description
	 * Function that triggers hooks execution
	 * @type {Function}
	 * @private
	 */
	_hooksFn;
	/**
	 * @description
	 * Runnables array
	 * @type {Array}
	 * @private
	 */
	_runnables = [];
	/**
	 * @description
	 * Execution context
	 * @type {object}
	 * @private
	 */
	_context;

	/**
	 * @constructor
	 * @param {Function} hooksFn - Function that triggers hook execution
	 * @param {string} before - Hook that runs before group execution
	 * @param {string} beforeEach - Hook that runs before execution of each group member
	 * @param {string} afterEach - Hook that runs after execution of each group member
	 * @param {string} after - Hook that runs after group execution
	 * @param {object} context - Execution context
 	 */
	constructor({hooksFn, before, beforeEach, afterEach, after, context} = {}) {
		this._hooksFn = hooksFn;
		this._hooks.before = before;
		this._hooks.beforeEach = beforeEach;
		this._hooks.afterEach = afterEach;
		this._hooks.after = after;
		this._context = context;
	}

	__hook = (hook) => ({ func: this._hooksFn, args: [ hook ] });
	__map = (runnable) => ([
		this.__hook(this._hooks.beforeEach),
		{ func: runnable.run, args: [], item: runnable, },
		this.__hook(this._hooks.afterEach),
	]);

	push = (runnable) => {
		return this._runnables.push(runnable);
	};

	get iterable() {
		if (this._runnables.length === 0) return [];
		return [
			this.__hook(this._hooks.before),
			this._runnables.filter(runnable => runnable.config.parallel).map(this.__map),
			...this._runnables.map(this.__map).flat(),
			this.__hook(this._hooks.after)
		].filter(item => !(item instanceof Array) || item.length !== 0);
	}
};