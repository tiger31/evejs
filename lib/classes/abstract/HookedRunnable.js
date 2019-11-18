const Runnable = require('./Runnable');
const Hooked = require('../mixins/Hooked');

/**
 * @class
 * @mixes Hooked
 * @extends Runnable
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
