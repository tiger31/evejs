
module.exports = class Collector {
	/**
	 * @description
	 * List of fields that should be collected in report
	 * @type {Array<object>}
	 */
	_collectable = [];
	/**
	 * @description
	 * If field is collector include result the name of result field will be this variable value
	 * @type {string}
	 * @private
	 */
	as;
	/**
	 * @constructor
	 */
	constructor(as, fields) {
		this.as = as;
		for (let field of fields) {
			if (typeof field === 'string') {
				this._collectable.push({field, as: field});
			}	else if ((field instanceof Collector) || (typeof field === 'object' && field.field && field.as)) {
				this._collectable.push(field);
			}	else {
				throw new TypeError('Collectable field should either be a string or object with properties \'field\' and \'as\'');
			}
		}
	}

	/**
	 * @param {object} from - Object to collect properties from
	 */
	collect(from) {
		// noinspection JSPotentiallyInvalidUsageOfThis
		return this._collectable.reduce((o, v) => {
			const value = (v instanceof Collector) ? v.collect(from) : this._retrieveValueFromPath(from, v.field.split('.'));
			this._placeValueByPath(o, v.as.split('.'), (v.transform) ? v.transform(value) : value);
			return o;
		}, {});
	}

	clear() {
		this._collectable = [];
	}

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