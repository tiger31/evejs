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
	_uuid = uuid();
	/**
	 * @description
	 * List of fields that should be collected in report
	 * @type {Array<object>}
	 */
	_collectable = [];
	/**
	 * @description
	 * Registers fields t be collected
	 * @param {string|object} fields
	 * @param {string} [fields.field] - Field to be collected
	 * @param {string} [fields.as] - Path in collected object
	 * @param {Function} [fields.transform] - Function to transform value
	 * @returns {*} any
	 */
	collect = (...fields) => {
		for (let field of fields) {
			if (typeof field === 'string') {
				this._collectable.push({field, as: field});
			}	else if (typeof field === 'object' && field.field && field.as) {
				this._collectable.push(field);
			}	else {
				throw new TypeError('Collectable field should either be a string or object with properties \'field\' and \'as\'');
			}
		}
	};

	clear() {
		this._collectable = [];
	}

	get collected() {
		// noinspection JSPotentiallyInvalidUsageOfThis
		return this._collectable.reduce((o, v) => {
			const value = this._retrieveValueFromPath(this, v.field.split('.'));
			this._placeValueByPath(o, v.as.split('.'), (v.transform) ? v.transform(value) : value);
			return o;
		}, { id: this._uuid });
	};

	/**
	 * @description
	 * Returns property's value in object by it's path
	 * @param {object} obj - Object to search value in
	 * @param {Array<string>} path - Path in object
	 * @private
	 */
	_retrieveValueFromPath(obj, path) {
		const c = path.shift();
		return (obj[c] !== undefined) ? (path.length) ? this._retrieveValueFromPath(obj[c], path) : obj[c] : null;
	}

	_placeValueByPath(obj, path, value) {
		const dest = path.pop();
		if (!dest) throw new ReferenceError('Path is empty');
		let link = obj;
		for (const p of path) {
			if (!link[p])
				link[p] = {};
			link = link[p];
		}
		link[dest] = value;
	}

};