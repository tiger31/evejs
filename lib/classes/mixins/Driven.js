//JSDoc plugin handles mixins really bad
/* eslint-disable jsdoc/require-returns */
/**
 * @external External
 * @external Runnable
 * @mixin
 * @param {Runnable} Base - Mixes class
 */
/* eslint-enable jsdoc/require-returns */
const Driven = Base => class extends Base {
	/**
	 * @type {External}
	 */
	_external;
	/**
	 * @description
	 * Setter for external
	 * @param {External} value - External
	 */
	set external (value) {
		this._external = value;
		this.proxy(this._external.events, this._external.entity);
	}

	/**
	 * @description
	 * Returns object of exports from external entity
	 * @returns {object} exports - Exports from external entity
	 */
	get externalExports () {
		return this._external ? this._external.exports : {};
	}

	/**
	 * @description
	 * Returns object that should be bing to framework instance to identify actual Driven instance
	 * @returns {*} augmentation
	 */
	getAugmentation () {
		return this;
	}

};

module.exports = Driven;