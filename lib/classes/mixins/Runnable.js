const Promise = require('bluebird');
const { MITimeoutError } = require('../../errors');

Promise.config({
	cancellation: true
});
/**
 * @description
 * Adds Runnable functionality to class
 * @mixin
 */
module.exports = (Base) => class extends Base {
	/**
	 * @description
	 * Function that will be executed
	 * @type {Function}
	 * @private
	 */
	_function;

	/**
	 * @description
	 * Returns runnable's function
	 * @returns {Function}
	 */
	get function () {
		return this._function;
	}

	/**
	 * @description
	 * Sets runnable's function
	 * @param {Function} value
	 * @throws {TypeError} - If value is not a function
	 */
	set function (value) {
		if (typeof value !== 'function')
			throw new TypeError('Runnable.function should be type of function');
		return this._function = value;
	}

	/**
	 * @description
	 * Function execution timeout
	 * @type {number}
	 * @private
	 */
	_timeout = 2000;

	/**
	 * @returns {number} - Runnable execution timeout
	 */
	get timeout () {
		return this._timeout;
	}

	/**
	 * @param {number} value - Timeout
	 * @throws {TypeError} - If value is not a number
	 */
	set timeout(value) {
		if (typeof value !== 'number')
			throw new TypeError('Timeout should be type of number');
		return this._timeout = value;
	}

	/**
	 * @description
	 * Runnable title
	 * @type {string}
	 * @private
	 */
	_title;

	/**
	 * @returns {string} - Runnable title
	 */
	get title() {
		return this._title;
	}

	/**
	 * @param {string} value - Runnable title
	 * @throws {TypeError} - If value is not a string
	 */
	set title(value) {
		if (typeof value !== 'string')
			throw new TypeError('Title should be type of string');
		return this._title = value;
	}

	/**
	 * @description
	 * Executes function
	 * @throws errors.MITimeoutError - Time excided
	 * @returns {Promise|*} any
	 */
	delayed() {
		const p = Promise.try(() => {
			return this.function()
		});
		if (this.timeout > 0)
			return p.timeout(this.timeout, new MITimeoutError(this, this.timeout))
		return p;
	}
};