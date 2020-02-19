const Runnable = require('../mixins/Runnable');
const EventEmitter = require('events').EventEmitter;

const events = {
	HOOK_FAILED: 'hook_failed',
	HOOK_SUCCEEDED: 'hook_succeeded'
};

const Hook = class Hook extends Runnable(EventEmitter) {
	/**
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {object} config - Hook config
	 * @param {number} [config.timeout=2000] - Hook timeout
	 */
	constructor({fn, title} = {}, {timeout = 2000} = {}) {
		super();
		this.function = fn;
		this.title = title;
		this.timeout = timeout;
	}

	/**
	 * @description
	 * Run function that do not throw anything
	 * @async
	 * @throws {Error} error - If hook function throws
	 * @returns {*} ignored
	 */
	run() {
		return super.delayed().then(() => {
			this.emit(events.HOOK_SUCCEEDED, this);
		}).catch((err) => {
			this.emit(events.HOOK_FAILED, this, err);
		})
	}

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Hook';
};

module.exports = Hook;
module.exports.events = events;