/**
 * @description
 * Adds exporter functionality
 * @param {object} Base - Base class
 * @returns {*} mixed
 */
/* eslint-disable-next-line max-lines-per-function */
module.exports = Base => class extends Base {
	/**
	 * @description
	 * Values that have been retained from global object while export
	 * @type {object}
	 * @private
	 */
	_globals = {};
	/**
	 * @description
	 * Object with things to be exported
	 * @type {object}
	 */
	exports = {};

	/**
	 * @description
	 * Exports group or everything from exports into global object
	 * @param {string} [group] - Export group
	 * @throws {ReferenceError} - If group does not exist
	 */
	export(group) {
		const target = this._flatExports(group);
		for (const key in target) {
			// noinspection JSUnfilteredForInLoop
			this._globals[key] = global[key];
			// noinspection JSUnfilteredForInLoop
			global[key] = target[key];
		}
	}

	/**
	 * @description
	 * Retains exported things from global object and returns it's previous values
	 * @param {string} [group] - Export group
	 * @throws {ReferenceError} - If group does not exist
	 */
	retain(group) {
		const target = this._flatExports(group);
		for (const key in target) {
			// noinspection JSUnfilteredForInLoop
			global[key] = this._globals[key];
			// noinspection JSUnfilteredForInLoop
			delete this._globals[key];
		}
	}

	/**
	 * @description
	 * Flats exports from groups
	 * @private
	 * @param {string} [group] - Exports group
	 * @returns {object} exports
	 */
	_flatExports(group) {
		if (group && !this.exports[group])
			throw new ReferenceError(`Export group "${group}" does not exist`);
		const target = (group) ? this.exports[group] : this.exports;
		// noinspection JSValidateTypes
		return Object.keys(target).reduce((o, p) => {
			if (target[p] instanceof Object && target[p].constructor.name === 'Object' && !group)
				Object.assign(o, target[p]);
			else
				o[p] = target[p];
			return o;
		}, {});
	}
};