const Runnable = require('./abstract/Runnable');
const Promise = require('bluebird');

module.exports = class Task extends Runnable {
	_before;
	_runnable;
	_after;
	constructor(before, runnable, after, name = 'Task') {
		super({
			name,
			fn: function runTask () {
				return Promise.mapSeries([before, runnable, after], function (item) {
					return item.run();
				});
			}
		});
		this._before = before;
		this._runnable = runnable;
		this._after = after;
	}

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1
	};

};
