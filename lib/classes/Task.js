const Runnable = require('./mixins/Runnable');
const Promise = require('bluebird');

const Task = class Task extends Runnable(class {}) {
	before;
	runnable;
	after;

	constructor(before, runnable, after, title = 'Task', timeout = -1) {
		super();
		this.before = before;
		this.runnable = runnable;
		this.after = after;
		this.title = title;
		this.timeout = timeout;
		this.function = function runTask () {
			if (runnable.skip)
				return runnable.ignore();
			return Promise.mapSeries([ before, runnable, after ].filter(i => i), (item) => {
				return item.run();
			});
		};
	}

	run() {
		return super.delayed();
	}

	ignore() {
		return this.runnable.ignore();
	}

};

module.exports = Task;
