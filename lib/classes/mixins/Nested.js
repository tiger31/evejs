/**
 * @description
 * Adds nesting control functionality
 * @mixin
 */
module.exports = (Base) => class extends Base {
	/**
	 * @description
	 * Forbids nesting for instances with same consistence key util release() called
	 */
	lock() {
		if (this.constructor.nested !== true) {
			if (this.isNestingLocked())
				throw new errors.MIConsistenceError(this);
			const prop = global[this.constructor.consistenceProperty];
			if (prop) {
				prop[this.constructor.consistenceKey] = true;
			} else {
				global[this.constructor.consistenceProperty] = {
					[this.constructor.consistenceKey]: true
				};
			}
		}
	}

	/**
	 * @description
	 * Allows nesting for instances with same consistence key
	 */
	release() {
		if (!this.constructor.nested)
			global[this.constructor.consistenceProperty][this.constructor.consistenceKey] = false;
	}

	/**
	 * @description
	 * Checks if another entity with same consistence key locked nesting
	 */
	isNestingLocked() {
		return (global[this.constructor.consistenceProperty]) ? global[this.constructor.consistenceProperty][this.constructor.consistenceKey] : false;
	}

	/**
	 * @description
	 * If 'true', allows nesting for this Runnable's child class
	 * @example
	 * //Let's imagine, this runnable exports global function 'runnable' that creates class instance somewhere
	 * runnable(() => {
	 *   console.log("Depth 1")
	 *   //So, this runnable call wii throw error if 'nested' param set to false, else there will be no errors
	 *   runnable(() => {
	 *     console.log("Depth 2")
	 *   })
	 * })
	 * @static
	 * @type {boolean}
	 */
	static nested = false;

	/**
	 * @static
	 * @type {string}
	 */
	static consistenceKey = 'NestedChild';

	/**
	 * @static
	 * @type {string}
	 */
	static consistenceProperty = 'EVE_CONSISTENCE';
};