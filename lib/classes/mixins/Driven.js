/**
 * @external External
 * @mixin
 * @param {Runnable} Base
 */
const Driven = (Base) => class extends Base {
	/**
	 * @type {External}
	 */
	_external;
	/**
	 * @description
	 * Setter for external
	 * @param {External} value
	 */
	set external (value) {
		this._external = value;
		this.proxy(this._external.events, this._external.entity);
	};

	/**
	 * @description
	 * Returns object of exports from external entity
	 * @returns {object}
	 */
	get externalExports () {
		return this._external ? this._external.exports : {};
	};

	/**
	 * @description
	 * Returns object that should be bing to framework instance to identify actual Driven instance
	 * @returns {*}
	 */
	getAugmentation () {
		return this;
	}

};

module.exports = Driven;