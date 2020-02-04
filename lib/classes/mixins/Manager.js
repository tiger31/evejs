const Test = require('../Test');
const ManagerGroup = require('../ManagerGroup');
const Promise = require('bluebird');
/**
 * @external Runnable
 * @description
 * Adds functionality to run groups of Runnables or single ones
 * Also provides step/parallel run controls
 * @mixin
 */
const Manager = (Base) => class extends Base {
	/**
	 *
	 * @type {object.<string, ManagerGroup>}
	 * @private
	 */
	__groups = {};
	/**
	 * @description
	 * Runs group of runnables with hooks
	 * @param {string} [group] - Group's name
	 */
	run = (group = this.constructor.__default) => {
		const managerGroup = this.__groups[group];
		if (!managerGroup)
			throw new ReferenceError(`Group ${group} not registered`);
		let skip = false;
		return Promise.mapSeries(managerGroup.iterable, function (item) {
			//Parallel case
			if (item instanceof Array) {
				return Promise.map(item, function(item) {
					return Promise.mapSeries(item, function(item) {
						return item.func(...item.args)
					})
				}).then(() => {
					if (item.map(i => i.find(j => j.item)).filter(i => i.state && i.state === Test.states.FAILED))
						skip = true;
				});
			} else { //Non-parallel case
				if (!skip)
					return item.func(...item.args).then(() => {
						if (item.item && item.item.state === Test.states.FAILED)
							skip = true;
					});
				else
					return (item.item && item.item.skip());
			}
		});
	};

	set group(value) {
		if (!(value instanceof ManagerGroup))
			throw TypeError('Group should be instance of ManagerGroup');
		return this.__groups[this.constructor.__default] = value;
	}

	getGroup = (group = this.constructor.__default) => {
		return this.__groups[group]._runnables;
	};

	push = (runnable, group = this.constructor.__default) => {
		this.__groups[group]._runnables.push(runnable);
	};

	/**
	 * @description
	 * Default group to run if no group specified
	 * @type {string}
	 * @private
	 */
	static __default = 'runnables';
};

module.exports = Manager;