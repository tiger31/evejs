const Runnable = require('./abstract/Runnable');
const Collectable = require('./mixins/Collectable');
const utils = require('../utils');

/**
 * @class
 * @public
 * @augments Runnable
 * @typedef {Seed}
 */
const Seed = class Seed extends Collectable(Runnable) {
	suite;
	error;
	finished;
	status = this.constructor.status.NOT_STARTED;
	/**
	 * @external Suite
	 * @see Runnable
	 * @param {object} args - Runnable args object
	 * @param {Suite} args.suite - Suite, this seeding function belongs to
	 * @param {object} config - Config object for seeding function
	 */
	constructor({fn, name, context, suite} = {}, config) {
		super({fn, name, context}, config);
		this.suite = suite;
	}

	/**
	 * @description
	 * Sets current state of seeding task execution
	 * @param {number} state - Current seed state
	 * @param {Error?} err - Error while seeding
	 */
	state(state, err) {
		if (!this.finished) {
			this.error = err;
			this.status = state;
			this.emit(this.constructor.events.EVENT_SEED_STATUS_CHANGED, this, state, err);
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
		this.destroy();
	}

	/**
	 * @description
	 * Runs seeding task
	 * @public
	 * @returns {Promise} result
	 */
	async run() {
		this.emit(Runnable.events.EVENT_RUNNABLE_BEGIN);
		this.state(this.constructor.status.IN_PROGRESS);
		return this.delayed()
			.then(() => this.state(this.constructor.status.SUCCEEDED))
			.catch((error) => {
				this.state(this.constructor.status.FAILED, error); throw error;
			});
	}

	/**
	 * @override
	 * @see Collectable
	 */
	collect = () => { //TODO timings
		return {
			id: this._collectable_uuid,
			run_id: this.suite.runner._collectable_uuid,
			name: this.name,
			status: this.status,
			error: JSON.stringify(utils.errorToOj(this.error)),
			config: JSON.stringify(this.config),
			filter: {
				scope: this.config.scope,
				epic: this.config.epic,
				feature: this.config.feature,
				story: this.config.story,
				project_id: this.config.id
			}
		}
	};

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

Seed.events.EVENT_SEED_STATUS_CHANGED = 'seed_status';

module.exports = Seed;