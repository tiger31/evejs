const moment = require('moment');

module.exports = class LogRecord {
  constructor({level = LogRecord.level.INFO, prefix = [], message, error = null, data = null, build = true} = {}) {
		this.timestamp = moment();
		this.level = level;
		this.prefix = prefix;
		this.message = message;
		this.error = error;
		this.data = data;
		this.builder = [];
		if (build)
			this.string = this.build();
	}

	wrap(str) {
		return `[${str}]`;
	};

	addLevel() {
		this.builder.push(this.wrap(LogRecord.levelColor[this.level] || LogRecord.level.ALL))
	}

	addPrefix() {
		this.builder.push(...this.prefix.map(p => LogRecord.prefix[p]).filter(p => p).map(p => this.wrap(p)));
	}

	addMessage() {
		this.builder.push(` ${this.message}`)
	}
	
	addError() {
		if (this.error)
			this.builder.push(...['\n', this.error.stack]);
	}

	addData() {
		if (this.data)
			this.builder.push(...['\n', (!['object', 'function'].includes(typeof this.data)) ? this.data : JSON.stringify(this.data)]);
	}

	build() {
		this.addLevel();
		this.addPrefix();
		this.addMessage();
		this.addError();
		this.addData();
		return this.builder.join('');
	}

	serialize() {
		return {
			timestamp: this.timestamp.format(),
			level: this.level,
			prefix: this.prefix,
			message: this.message,
			error: this.error,
			data: this.data
		}
	}
}
