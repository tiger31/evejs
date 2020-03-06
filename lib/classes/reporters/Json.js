const fs = require('fs');

module.exports = class JsonReporter {
	constructor(runner) {
		runner.on(runner.constructor.events.EVENT_STATE_EXIT, () => {
			const result = runner.collected;
			const dir = runner.config['results-dir'];
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir)
			}
			fs.writeFileSync(`${dir}/${Date.now()}.json`, JSON.stringify(result));
		})
	}
};