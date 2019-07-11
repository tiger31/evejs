const Emitter = require('./EventEmitter.js');

function AsyncJob (suite, name, func, config) {
	this.suite = suite;
	this.emitter = new Emitter("statusChange fail success", this);
	this.name = name;
	this.function = func;
	this.status = AsyncJob.status.NOT_STARTED;
	this.frozen = false;
	this.err = undefined;
	this.timeoutLength = (config && config.timeout) ? config.timeout : global.MIRunner.config.timeout;
	this.timer;

	//Proxy event emitting and setting up status changing on event;
	this.on = (...args) => this.emitter.on(...args);
	this.off = (...args) => this.emitter.off(...args);
	this.on("statusChange", (status, err) => {
		if (this.frozen)
			return;
		this.status = status;
		if (err)
			this.err = err;
		if (status === AsyncJob.status.FAILED) { 
			this.emitter.emit("fail", err);
			this.frozen = true;
		} else if (status === AsyncJob.status.SUCCESS) {
			this.emitter.emit("success");
			this.frozen = true;
		}
	});

	this.timeout = (timeout) => this.timeout = timeout;

	this.run = function() {
		this.emitter.emit("statusChange", AsyncJob.status.IN_PROGRESS);
		return new Promise((resolve, reject) => {
			//Setting up job timeout
			this.timer = setTimeout(() => {
				this.emitter.emit("statusChange", AsyncJob.status.FAILED, new Error(`Timeout ${this.timeoutLength}ms excided`));
				resolve();
			}, this.timeoutLength);
			//If func is async
			if (this.function[Symbol.toStringTag] === 'AsyncFunction') {
				this.function(suite.executionContext)
					.then(() => {
						this.emitter.emit("statusChange", AsyncJob.status.FINISHED);
						clearTimeout(this.timer);
						resolve();
					})
					.catch((err) => { 
						this.emitter.emit("statusChange", AsyncJob.status.FAILED, err)
						clearTimeout(this.timer);
						resolve();
					});
			} else { //If func is sync
				try {
					this.function(suite.executionContext);
					this.emitter.emit("statusChange", AsyncJob.status.FINISHED);
				} catch (err) {
					this.emitter.emit("statusChange", AsyncJob.status.FAILED, err);
				}
				resolve();
				clearTimeout(this.timer);
			}
		})
	}
}

AsyncJob.status = {
	NOT_STARTED: 0,
	IN_PROGRESS: 1,
	FAILED: 2,
	FINISHED: 3,	
}

module.exports = AsyncJob;
