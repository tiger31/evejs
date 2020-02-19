const Runnable = require('./mixins/Runnable');
const Promise = require('bluebird');

module.exports = class TaskGroup extends Runnable(class {}) {
	tasks;
	parallel;
	before;
	after;
	skip = false;

	constructor(tasks, parallel = true, before, after, title = 'TaskGroup', timeout = -1) {
		super();
		this.tasks = tasks;
		this.parallel = parallel;
		this.before = before;
		this.after = after;
		this.title = title;
		this.timeout = timeout;
	}

	/**
	 * @abstract
	 * @returns {boolean};
	 */
	skipCondition = (task) => false;

	run() {
		const _this = this;
		const fn = (this.parallel) ? 'map' : 'mapSeries';
		const group = {
			run: () => Promise[fn](this.tasks, function(item) {
				if(!_this.skip && !item.skip)
					return item.run().finally(() => {
						_this.skip = _this.skipCondition(item);
					});
				else
					return item.ignore();
			})
		};
		const arr = [this.before, group, this.after].filter(r => r);
		return Promise.mapSeries(arr, function(item) {
			return item.run();
		})
	}

};