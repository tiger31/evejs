const errors = require('../errors');

/**
 * @description
 * Single state on FSA
 * @class
 */
const State = class State {
	/**
	 * @description
	 * State name
	 * @type {string}
	 */
	name;
	/**
	 * @description
	 * Map of state transitions
	 * @type {object.<string|number, string|State>}
	 */
	transitions;
	/**
	 * @description
	 * Default next state if no transition were made
	 * @type {string|State}
	 */
	def;
	/**
	 * @description
	 * Is state idle
	 * Idle means state does not transition to other itself
	 * @type {boolean}
	 */
	idle;
	/**
	 * @description
	 * State inner function
	 * @type {Function}
	 */
	handler;

	/**
	 * @param {string} name - State name
	 * @param {object.<string|number, string>} transitions - State transitions
	 * @param {string} def - Default transition
	 * @param {boolean} idle - Is state idle
	 */
	constructor(name, transitions, def, idle = false) {
		this.name = name;
		this.transitions = transitions;
		this.def = def;
		this.idle = idle;
	}
};

module.exports = State;
