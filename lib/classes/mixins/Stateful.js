const errors = require('../../errors');
const State = require('../State');

/**
 * @description
 * Mixes FSA functionality
 * @mixin
 */
const Stateful = (Base) => class extends Base {
	/**
	 * @description
	 * Current state
	 * @type {State}
	 */
	state;
	/**
	 * @description
	 * Sets handler on a specific state
	 * @param {string} state - State
	 * @param {Function} handler - Handler function
	 */
	use = (state, handler) => {
		const inner = this._pick(state);
		inner.handler = handler;
	};

	/**
	 * @description
	 * Sets FSA to given state
	 * @param {string} state - Step into state
	 * @param {*} [context] - Additional state context
	 */
	enter = (state, context) => {
		let ended = false;
		/**
		 * @description
		 * Transits to next state depends on output
		 * @param {string|number} result - State result
		 * @param {*} [context] - Additional state context
		 */
		const end = (result, context) => {
			const to = this._transit(this.state, result);
			ended = true;
			this.enter(to, context);
		};

		const inner = this._pick(state);
		this.state = inner;
		inner.handler(end);
		if (!ended && !this.state.idle)
			this.enter(this.state.def);
	};

	/**
	 * @description
	 * Returns state by it's name ot throws error if state does not exist
	 * @param {string} name - State name
	 * @throws errors.MIIllegalState
	 * @private
	 * @returns {State} state
	 */
	_pick = (name) => {
		const state = this.constructor.states[name];
		if (!state) throw new errors.MIIllegalState(this, name, this.constructor.states);
		return state;
	};

	/**
	 * @description
	 * Returns transition depends on output of previous state
	 * @param {State} state - State
	 * @param {string|number} result - State result
	 * @throws errors.MIIllegalStateTransition
	 * @throws errors.MIIllegalState
	 * @private
	 * @returns {string} transitTo
	 */
	_transit = (state, result) => {
		const to = state.transitions[result];
		if (!to) throw new errors.MIIllegalStateTransition(this, this.state, result);
		return to;
	};

	/**
	 * @description
	 * Array of states
	 * @type {object.<string|number, State>}
	 */
	static states = {};
};

module.exports = Stateful;