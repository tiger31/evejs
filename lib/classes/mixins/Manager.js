const Hook = require('../abstract/Hook');
const Task = require('../Task');
const TaskGroup = require('../TaskGroup');
/**
 * @external Runnable
 * @description
 * Adds functionality to run groups of Runnables or single ones
 * Also provides step/parallel run controls
 * @mixin
 */
const Manager = (Base) => class extends Base {
	/**
	 * @type {Array.<TaskRunnable>}
	 * @private
	 */
	runnables = [];
	/**
	 * @type {object.<string, Hook>}
	 * @private
	 */
	hooks = {};

	/**
	 * @description
	 * Registers hook on this runnable
	 * @param {string} title - Hook name
	 * @param {Function} fn - Hook function
	 * @param {object} config - Hook config
	 * @throws errors.MIHookNotFound
	 * @returns {Hook} hook
	 */
	registerHook(title, fn, config) {
		return this._hooks[title] = new Hook({fn, title: title, context: this.context}, config);
	}

	/**
	 * @description
	 * Checks execution of last tasks. If returns true, manager skips execution of all left tasks
	 * @param {TaskRunnable} task - List of executed runnables
	 * @abstract
	 * @returns {boolean}
	 */
	skipCondition(task) {
		return false;
	}

	/**
	 * @description
	 * Runs group of runnables with hooks
	 */
	launch = (before, beforeEach, afterEach, after) => {
		const parallelGroup = this.runnables.filter(r => r.parallel).map(r => new Task(beforeEach, r, afterEach));
		const nonparallelGroup = this.runnables.filter(r => !r.parallel).map(r => new Task(beforeEach, r, afterEach));
		const parallel = new TaskGroup(parallelGroup);
		const outer = new TaskGroup([parallel, ...nonparallelGroup], false, before, after);
		outer.skipCondition = this.skipCondition;
		return outer.run();
	};

	static hooks = {};
};

module.exports = Manager;