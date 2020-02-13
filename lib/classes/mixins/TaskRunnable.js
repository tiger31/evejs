const Runnable = require('./Runnable');
/**
 * @description
 * Adds step/parallel/skip functionality to Runnable
 * @mixin
 * @augments Runnable
 */
module.exports = (Base) => class extends Runnable(Base) {
	/**
	 * @description
	 * Is this runnable should be executed in parallel with others
	 * @type {boolean}
	 * @private
	 */
	_parallel = false;

	/**
	 * @returns {boolean} - Runnable parallel flag
	 */
	get parallel () {
		return this._parallel;
	}

	/**
	 * @param {boolean} value - Parallel flag
	 * @throws {TypeError} - If value is not a boolean
	 */
	set parallel(value) {
		if (typeof value !== 'boolean')
			throw new TypeError('Parallel should be type of boolean');
		return this._parallel = value;
	}

	/**
	 * @description
	 * Is execution of group of runnables stops if runnable fails
	 * @type {boolean}
	 * @private
	 */
	_step = false;

	/**
	 * @returns {boolean} - Runnable parallel flag
	 */
	get step () {
		return this._step;
	}

	/**
	 * @param {boolean} value - Step flag
	 * @throws {TypeError} - If value is not a boolean
	 */
	set step(value) {
		if (typeof value !== 'boolean')
			throw new TypeError('Step should be type of boolean');
		return this._step = value;
	}

	/**
	 * @description
	 * Is runnable execution skipped in group execution
	 * @type {boolean}
	 * @private
	 */
	_skip = false;

	/**
	 * @returns {boolean} - Runnable skip flag
	 */
	get skip () {
		return this._skip;
	}

	/**
	 * @param {boolean} value - Skip flag
	 * @throws {TypeError} - If value is not a boolean
	 */
	set skip(value) {
		if (typeof value !== 'boolean')
			throw new TypeError('Skip should be type of boolean');
		return this._skip = value;
	}

	/**
	 * @description
	 * Presents whether runnable complete or not
	 * @type {boolean}
	 * @private
	 */
	_complete = false;

	get complete() {
		return this._complete;
	}

	set complete(value) {
		if (typeof value !== 'boolean')
			throw new TypeError('Complete should be type of boolean');
		return this._complete = value
	}
	
	/**
	 * @abstract
	 */
	ignore() {
		return super.ignore();
	}

	/**
	 * @abstract
	 */
	run() {
		return super.run();
	}

};