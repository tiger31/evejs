const uuid = require('uuid/v4');
const Collector = require('../Collector');

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
	_uuid = uuid();
	/**
	 * @description
	 * List of fields that should be collected in report
	 * @type {Collector}
	 */
	_collectable;
	/**
	 * @description
	 * Registers fields t be collected
	 * @param {Collector} collector -
	 * @returns {*} any
	 */
	collect = (collector) => {
		if (!(collector instanceof Collector)) {
			throw new TypeError('collector should be instance of Collector');
		}
		this._collectable = collector;
	};

	get collected() {
		return Object.assign({id: this._uuid}, this._collectable.collect(this));
	};
};