/**
 * @description
 * Adds nesting control functionality
 * @param {object} Base - Base class
 * @returns {*} mixed
 * @mixin
 */
/* eslint-disable-next-line max-lines-per-function */
module.exports = Base => class extends Base {
	/**
	 * @description
	 * Forbids nesting for instances with same consistence key util release() called
	 */
	lock() {
		if (this.constructor.nested !== true) {
			const prop = global[this.constructor.consistenceProperty];
			if (prop) {
				const key = prop[this.constructor.consistenceKey];
				if (key) {
					key.push(true);
				} else {
					prop[this.constructor.consistenceKey] = [ true ];
				}
			} else {
				global[this.constructor.consistenceProperty] = {
					[this.constructor.consistenceKey]: [ true ]
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
			global[this.constructor.consistenceProperty][this.constructor.consistenceKey].pop();
	}

	/**
	 * @description
	 * Checks if another entity with same consistence key locked nesting
	 * @returns {boolean} isLocked
	 */
	isNestingLocked() {
		const prop = global[this.constructor.consistenceProperty];
		if (!prop)
			return false;
		const key = prop[this.constructor.consistenceKey];
		if (!key)
			return false;
		else return key.length > 0;
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