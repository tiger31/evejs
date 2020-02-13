/**
 * @description
 * Allows to filter inherited instance with scope/epic/feature/story params
 * @mixin
 */
module.exports = (Base) => class Filterable extends Base {
	/**
	 * @description
	 * Execution scope
	 * @type {string|Array<string>}
	 */
	_scope;

	get scope() {
		return this._scope;
	}

	set scope(value) {
		const arr = ((value instanceof Array) ? value : [value]).filter(p => p);
		if (arr.some(s => typeof s !== "string"))
			throw new TypeError('Scope filter param should be either string or array of strings');
		return this._scope = value;
	}
	/**
	 * @type {string|Array<string>}
	 */
	_epic;

	get epic() {
		return this._epic;
	}

	set epic(value) {
		const arr = ((value instanceof Array) ? value : [value]).filter(p => p);
		if (arr.some(s => typeof s !== "string"))
			throw new TypeError('Epic filter param should be either string or array of strings');
		return this._epic = value;
	}
	/**
	 * @type {string|Array<string>}
	 */
	_feature;

	get feature() {
		return this._feature;
	}

	set feature(value) {
		const arr = ((value instanceof Array) ? value : [value]).filter(p => p);
		if (arr.some(s => typeof s !== "string"))
			throw new TypeError('Feature filter param should be either string or array of strings');
		return this._feature = value;
	}
	/**
	 * @type {string|Array<string>}
	 */
	_story;

	get story() {
		return this._story;
	}

	set story(value) {
		const arr = ((value instanceof Array) ? value : [value]).filter(p => p);
		if (arr.some(s => typeof s !== "string"))
			throw new TypeError('Story filter param should be either string or array of strings');
		return this._story = value;
	}

	get filterConfig() {
		return {
			scope: this._scope,
			epi: this._epic,
			feature: this._feature,
			story: this._story
		}
	}
};