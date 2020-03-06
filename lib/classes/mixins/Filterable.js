/**
 * @description
 * Allows to filter inherited instance with scope/epic/feature/story params
 * @param {object} Base - Base class
 * @returns {*} mixed
 * @mixin
 */
/* eslint-disable-next-line max-lines-per-function */
module.exports = Base => class Filterable extends Base {
	/**
	 * @description
	 * Execution scope
	 * @type {string|Array<string>}
	 */
	_scope;

	get scope() {
		return (this._scope.length) ? this._scope : null;
	}

	set scope(value) {
		const arr = ((value instanceof Array) ? value : [ value ]).filter(p => p);
		if (arr.some(s => typeof s !== 'string'))
			throw new TypeError('Scope filter param should be either string or array of strings');
		return this._scope = arr;
	}
	/**
	 * @type {string|Array<string>}
	 */
	_epic;

	get epic() {
		return (this._epic.length) ? this._epic : null;
	}

	set epic(value) {
		const arr = ((value instanceof Array) ? value : [ value ]).filter(p => p);
		if (arr.some(s => typeof s !== 'string'))
			throw new TypeError('Epic filter param should be either string or array of strings');
		return this._epic = arr;
	}
	/**
	 * @type {string|Array<string>}
	 */
	_feature;

	get feature() {
		return (this._feature.length) ? this._feature : null;
	}

	set feature(value) {
		const arr = ((value instanceof Array) ? value : [ value ]).filter(p => p);
		if (arr.some(s => typeof s !== 'string'))
			throw new TypeError('Feature filter param should be either string or array of strings');
		return this._feature = arr;
	}
	/**
	 * @type {string|Array<string>}
	 */
	_story;

	get story() {
		return (this._story.length) ? this._story : null;
	}

	set story(value) {
		const arr = ((value instanceof Array) ? value : [ value ]).filter(p => p);
		if (arr.some(s => typeof s !== 'string'))
			throw new TypeError('Story filter param should be either string or array of strings');
		return this._story = arr;
	}

	_shadowed = {
		_scope: [],
		_epic: [],
		_feature: [],
		_story: [],
		get scope() {
			return (this._scope.length) ? this._scope : null;
		},
		get epic() {
			return (this._epic.length) ? this._epic : null;
		},
		get feature() {
			return (this._feature.length) ? this._feature : null;
		},
		get story() {
			return (this._story.length) ? this._story : null;
		}
	};

	set shadowed({scope=[], epic=[], feature=[], story=[]}) {
		this._shadowed._scope = scope;
		this._shadowed._epic = epic;
		this._shadowed._feature = feature;
		this._shadowed._story = story;
	}

	get shadowed() {
		return {
			scope: this._shadowed.scope,
			epic: this._shadowed.epic,
			feature: this._shadowed.feature,
			story: this._shadowed.story,
		};
	}

	get filterConfig() {
		return {
			scope: this.scope,
			epic: this.epic,
			feature: this.feature,
			story: this.story,
			shadowed: this.shadowed
		};
	}
};