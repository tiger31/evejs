module.exports = (Base) => class extends Base {
	/**
	 * @type {object.<string, Function>}
	 * @protected
	 */
	_states = {};
	_next;
	/**
	 * @description
	 * Registers state function
	 * @param {string} title
	 * @param {Function} fn
	 */
	state = (title, fn) => {
		this._states[title] = fn;
	};

	next = (state, ...args) => this._next = {state, args};

	enter = (state, ...args) => this._enter(this.next(state, args));

	/**
	 * @description
	 * Enters state with given name
	 */
	_enter = () => {
		const n = this._next;
		if (this._next && !this._states[this._next.state])
			throw new ReferenceError(`There's no handler for state ${name}`);
		const result = this._states[this._next.state](...this._next.args);
		if (result instanceof Promise)
			return result.then(this._enter)
				.catch(this._enter);
		else if (this._next !== n) return this._enter()
	}
};