const Emitter = require('events').EventEmitter;

class AsyncJob extends Emitter {
	constructor(suite, name, func, config) {
		super();

		this.suite = suite;
		this.name = name;
		this.function = func;
		this.status = AsyncJob.status.NOT_STARTED;
		this.frozen = false;
		this.err = undefined;
		this.timeoutLength = (config && config.timeout) ? config.timeout : global.MIRunner.config.timeout;
		this.timer;

		//Proxy event emitting and setting up status changing on event;
		this.on("statusChange", (status, err) => {
			if(this.frozen)
				return;
			this.status = status;
			if(err)
				this.err = err;
			if(status === AsyncJob.status.FAILED) {
				this.emit("fail", err);
				this.frozen = true;
			} else if(status === AsyncJob.status.FINISHED) {
				this.emit("success");
				this.frozen = true;
			}
		});

		this.timeout = (timeout) => this.timeout = timeout;

		this.run = function() {
			this.emit("statusChange", AsyncJob.status.IN_PROGRESS);
			return new Promise((resolve, reject) => {
				//Setting up job timeout
				this.timer = setTimeout(() => {
					this.emit("statusChange", AsyncJob.status.FAILED, new Error(`Timeout ${this.timeoutLength}ms excided`));
					resolve();
				}, this.timeoutLength);
				//If func is async
				if(this.function[Symbol.toStringTag] === 'AsyncFunction') {
					this.function(suite.executionContext)
						.then(() => {
							this.emit("statusChange", AsyncJob.status.FINISHED);
							clearTimeout(this.timer);
							resolve();
						})
						.catch((err) => {
							this.emit("statusChange", AsyncJob.status.FAILED, err);
							clearTimeout(this.timer);
							resolve();
						});
				} else { //If func is sync
					try {
						this.function(suite.executionContext);
						this.emit("statusChange", AsyncJob.status.FINISHED);
					} catch (err) {
						this.emit("statusChange", AsyncJob.status.FAILED, err);
					}
					resolve();
					clearTimeout(this.timer);
				}
			})
		}
	}
}
AsyncJob.status = {
	NOT_STARTED: 0,
	IN_PROGRESS: 1,
	FAILED: 2,
	FINISHED: 3,	
};

module.exports = AsyncJob;
