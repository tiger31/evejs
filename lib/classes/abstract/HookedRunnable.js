const Runnable = require('./Runnable');
const Hooked = require('../mixins/Hooked');

/**
 * @class
 * @mixes Hooked
 * @extends Runnable
 * @typedef {HookedRunnable}
 */
const HookedRunnable = class HookedRunnable extends Hooked(Runnable) {
	/**
	 * @constructor
	 * @see Runnable
 	 */
	constructor({fn, name, context} = {}, config) {
		super({fn, name, context}, config);
		this.defineHooks();
	}

};

module.exports = HookedRunnable;
