const Runnable = require('./Runnable');

const Hook = class Hook extends Runnable {
	error;

	/**
	 * @see Runnable
	 * @param {object} args - Runnable args
	 * @param {object} config - Hook config
	 */
	constructor({fn, context, name} = {}, config) {
		super({fn, context, name}, config);
	}

	/**
	 * @description
	 * Run function that do not throw anything
	 * @async
	 * @throws {Error} error - If hook function throws
	 * @returns {*} ignored
	 */
	async run() {
		return await super.run().then(() => this.error = null).catch((err) => {this.error = err; throw err; });
	}

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Hook';
};

module.exports = Hook;