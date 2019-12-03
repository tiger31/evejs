//JSDoc plugin handles mixins really bad
/* eslint-disable jsdoc/require-returns */
/**
 * @mixin
 * @param {object} Base - Mixes class
 */
/* eslint-enable jsdoc/require-returns */
module.exports = Base => class extends Base {
	/**
	 * @type {object.<string, Function>}
	 * @protected
	 */
	_states = {};
	_next;
	/**
	 * @description
	 * Registers state function
	 * @param {string} title - State name
	 * @param {Function} fn - State function
	 */
	state = (title, fn) => {
		this._states[title] = fn;
	};

	/**
	 * @description
	 * Sets next state
	 * @param {string} state - State name
	 * @param {Array.<*>} args - State function args
	 * @returns {object.<string, Array|undefined>} next
	 */
	next = (state, ...args) => this._next = {state, args};

	// Next calcs before function executes, doesn't matter if it's not needed as argument
	// noinspection JSCheckFunctionSignatures
	/**
	 * @description
	 * Sets next state
	 * @param {string} state - State name
	 * @param {Array.<*>} args - State function args
	 * @returns {*} any
	 */
	enter = (state, ...args) => this._enter(this.next(state, args));

	/**
	 * @description
	 * Enters state with given name
	 * @returns {*|undefined} any
	 */
	_enter = () => {
		const n = this._next;

		/**
		 * @description
		 * Enters next state if it's not equal to current
		 * @returns {*|undefined} any
		 */
		const next = () => {
			if (this._next !== n)
				return this._enter();
		};

		if (this._next && !this._states[this._next.state])
			throw new ReferenceError(`There's no handler for state ${name}`);
		const result = this._states[this._next.state](...this._next.args);
		if (result instanceof Promise)
			return result.then(next)
				.catch(next);
		else if (this._next !== n) return next();
	};

};