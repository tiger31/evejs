const Runnable = require('./mixins/Runnable');
const Promise = require('bluebird');

const Task = Runnable(class Task {
	before;
	runnable;
	after;

	constructor(before, runnable, after, title = 'Task', timeout = -1) {
		this.before = before;
		this.runnable = runnable;
		this.after = after;
		this.title = title;
		this.timeout = timeout;
		this.function = function runTask () {
			return Promise.mapSeries([before, runnable, after], function(item) {
				return item.run();
			});
		}
	}

	run() {
		return super.delayed();
	}
});

module.exports = Task;
