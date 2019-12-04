const uuid = require('uuid/v4');

/**
 * @mixin
 */
module.exports = Base => class extends Base {
	/**
	 * @description
	 * Creates uuid for easy entity detecting
	 * @protected
	 * @type {string}
	 */
	_collectable_uuid = uuid();
	/**
	 * @description
	 * Returns object
	 * @abstract
	 * @returns {*} any
	 */
	collect = () => {
		return {
			uuid: this._collectable_uuid
		}
	}
};