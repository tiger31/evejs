const Runnable = require('./abstract/Runnable');
const errors = require('../errors');

/**
 * @class
 * @public
 * @extends Runnable
 * @typedef {Seed}
 */
const Seed = class Seed extends Runnable {
	suite;
	error;
	finished;
	status = this.constructor.status.NOT_STARTED;
	/**
	 * @constructor
	 * @see Runnable
	 * @param {Object} args - Runnable args object
	 * @param args.fn
	 * @param args.context
	 * @param args.name
	 * @param args.suite - Suite, this seeding function belongs to
	 * @param {object} config - Config object for seeding function
	 */
	constructor({fn, name, context, suite} = {}, config) {
		super({fn, name, context}, config);
	}

	/**
	 * @description
	 * Sets current state of seeding task execution
	 * @param state
	 * @param err
	 */
	state(state, err) {
		if (!this.finished) {
			this.err = err;
			this.status = state;
			this.emit(this.constructor.events.EVENT_SEED_STATUS_CHANGED, state, err);
			if (state === this.constructor.status.FAILED || state === this.constructor.status.SUCCEEDED) {
				this.freeze();
			}
		} else {
			this.freeze();
		}
	}

	/**
	 * @description
	 * Freezes state and resets nesting prop
	 */
	freeze() {
		this.finished = true;
		clearTimeout(this.timer);
		this.emit(Runnable.events.EVENT_RUNNABLE_END);
	}

	/**
	 * @description
	 * Runs seeding task
	 * @public
	 * @return {Promise} result
	 */
	async run() {
		this.emit(Runnable.events.EVENT_RUNNABLE_BEGIN);
		this.state(this.constructor.status.IN_PROGRESS);
		return this.delayed()
			.then(() => this.state(this.constructor.status.SUCCEEDED))
			.catch((error) => { this.state(this.constructor.status.FAILED, error); throw error; });
	}

	static status = {
		NOT_STARTED: 0,
		IN_PROGRESS: 1,
		FAILED: 2,
		SUCCEEDED: 3,
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Seed';
};

//Rewriting nesting props

Seed.events.EVENT_SEED_STATUS_CHANGED = 'seed_status';

module.exports = Seed;