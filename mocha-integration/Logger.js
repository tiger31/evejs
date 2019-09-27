const Colors = require('./Colors.js');
const LogRecord = require('./LogRecord.js');
const Serializable = require('./Serializable.js');

function Logger (showLevel = LogRecord.level.INFO, defaultLevel = LogRecord.level.INFO, objectToJSON = true) {
	this.history = [];
	this.showLevel = showLevel;
	this.level = defaultLevel;
	this.levels = Object.values(LogRecord.level);
	this.showIndex = this.levels.indexOf(this.showLevel);
	const serializables = [];
	const self = this;
	
	function log({level = defaultLevel, prefix, message, error, data} = {}) {
		self.print(new LogRecord(arguments[0]));
	}
	
	this.log = log;

	Object.keys(LogRecord.level)
		.forEach(level => self[level.toLowerCase()] = (args) => log(Object.assign(args, { level: LogRecord.level[level] })));

	this.registerModule = function registerModule(module) {
		if (!(module instanceof Serializable))
			throw new Error("module is not instance of Serializable");
		serializables.push(module);
	}

	this.serialize = function serialize() {
		let cache = [];
		//In case of circular json
		return JSON.stringify(serializables.reduce((o,s) => { o[s.name] = s.serialize(); return o }, {})	
		, function(key, value) {
			if (typeof value === 'object' && value !== null) {
					if (cache.indexOf(value) !== -1) {
							// Duplicate reference found, discard key
							return;
					}
					// Store value in our collection
					cache.push(value);
			}
			return value;
		});
		cache = [];
	}

	this.list = function list({level = defaultLevel, prefix, message, data} = {}) {
		self.print(new LogRecordList(Object.assign({ build: true }, arguments[0])));
	}

	this.title = function title(message, length) {
		self.print(new LogTitle({message: message, length: length }));	
	}

	this.print = function print(record) {
		this.history.push(record);
		const index = this.levels.indexOf(record.level);
		if (this.showLevel !== LogRecord.level.OFF && index !== -1 && index >= this.showIndex)
			console.log(record.string);
	}
}

class LogRecordList extends LogRecord {
	constructor(...args) {
		super(...args);
	}

	addError() {}

	addData() {
		if (this.data instanceof Array) {
			this.builder.push('\n', ...this.data.map(element => `  -> ${element}\n`));
			this.builder.push(`...total ${this.data.length} elements`);
		} else super.addData();	
	}
}

class LogTitle extends LogRecord {
	constructor({ message, length = 53 } = {}) {
		super({ message: message, build: false });
		this.length = 53;
		this.string = this.build();
	}
		
	addMessage () {
		this.builder.push(this.message.padStart(Math.floor((this.message.length + this.length) / 2), '-').padEnd(this.length, '-'));	
	}

	addLevel() {}
	addPrefix() {}
	addError() {}
	addData() {}

}


LogRecord.prefix = {
	STARTUP: Colors.green("Startup"),
	ASYNC: Colors.green("Async"),
	MOCHA: Colors.green("Mocha"),
	INTERCEPT: Colors.blue("Intercept"),
	DATA: Colors.default("Data"),
}

LogRecord.level = {
	ALL: "Verbose",
	DEBUG: "Debug",
	INFO: "Info",
	WARNING: "Warning",
	ERROR: "Error",
	FATAL: "Fatal",
}

LogRecord.levelColor = {
	[LogRecord.level.ALL]: Colors.default(LogRecord.level.ALL),
	[LogRecord.level.DEBUG]: Colors.yellow(LogRecord.level.DEBUG),
	[LogRecord.level.INFO]: Colors.blue(LogRecord.level.INFO),
	[LogRecord.level.WARNING]: Colors.yellow(LogRecord.level.WARNING),
	[LogRecord.level.ERROR]: Colors.red(LogRecord.level.ERROR),
	[LogRecord.level.FATAL]: Colors.red(LogRecord.level.FATAL),
}

module.exports = Logger;
