const Bluebird = require('bluebird');
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
	_next = [];
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
	 * @param {...*} args - State function args
	 * @returns {object.<string, Array|undefined>} next
	 */
	next = (state, ...args) => this._next.push({state, args});

	// Next calcs before function executes, doesn't matter if it's not needed as argument
	// noinspection JSCheckFunctionSignatures
	/**
	 * @description
	 * Sets next state
	 * @param {string} state - State name
	 * @param {Array.<*>} args - State function args
	 * @returns {*} any
	 */
	enter = (state, ...args) => {
		this.next(state, args);
		return this._enter();
	};

	/**
	 * @description
	 * Enters state with given name
	 * @returns {*|undefined} any
	 */
	_enter = () => {
		const n = this._next.pop();
		if (n) {
			if(!this._states[n.state])
				throw new ReferenceError(`There's no handler for state ${n.name}`);
			const result = this._states[n.state](...n.args);
			if (result instanceof Promise || result instanceof Bluebird)
				return result.then(this._enter)
					.catch((error) => { throw error });
			else return this._enter();
		}
	};

};