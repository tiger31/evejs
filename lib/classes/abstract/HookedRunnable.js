const Runnable = require('./Runnable');
const Hooked = require('../mixins/Hooked');

/**
 * @class
 * @mixes Hooked
 * @augments Runnable
 */
const HookedRunnable = class HookedRunnable extends Hooked(Runnable) {
	/**
	 * @see Runnable
	 * @param {object} args - Hooked args
	 * @param {object} config - HookedRunnable config
	 */
	constructor({fn, name, context} = {}, config) {
		super({fn, name, context}, config);
		this.defineHooks();
	}
};

module.exports = HookedRunnable;
