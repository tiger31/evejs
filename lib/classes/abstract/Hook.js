const Runnable = require('./Runnable');

const Hook = class Hook extends Runnable {
	error;

	/**
	 * @constructor
	 * @see Runnable
	 */
	constructor({fn, context, name} = {}, config) {
		super({fn, context, name}, config);
	}

	/**
	 * @description
	 * Run function that do not throw anything
	 */
	async run() {
		return await super.run().catch((err) => {this.error = err;});
	}

	/**
	 * @override
	 * @see Runnable
	 */
	static consistenceKey = 'Hook';
};

module.exports = Hook;