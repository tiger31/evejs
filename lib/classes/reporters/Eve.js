const Base = require('./Base');
const Json = require('./Json');

module.exports = class EveReporter extends Base {
	constructor(runner) {
		super(runner);
		this.json = new Json(runner);
	}
};