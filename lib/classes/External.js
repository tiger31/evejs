

const External = class External {
	/**
	 * @description
	 * Things that should be exported from external framework entity
	 * @type {object.<string, *>}
	 */
	exports;
	/**
	 * @description
	 * Events that will be proxied from external framework entity
	 * @type {Array.<string|object>}
	 */
	events;
	/**
	 * @description
	 * External framework entity itself
	 * @type {*}
	 */
	entity;

	/**
	 * @param {object} args - Args
	 * @param {object.<string, *>} [args.exports={}] - Exports from external entity
	 * @param {Array.<string|object>} [args.events=[]] - Events from external entity
	 * @param {*} args.entity - External entity
	 */
	constructor({exports = {}, events = [], entity} = {}) {
		this.exports = exports;
		this.events = events;
		this.entity = entity;
	}
};

module.exports = External;