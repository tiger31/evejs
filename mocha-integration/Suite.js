const path = require('path');

const AsyncJob = require('./AsyncJob.js');
const Emitter = require('./EventEmitter.js');

function Suite(func, {
	asyncErrorMode,
	asyncErrorBehaviour,
	feature,
	epic,
} = {}) {
	const runner = global.MIRunner;
	this.asyncErrorMode = asyncErrorMode || runner.config.asyncErrorMode || Suite.asyncErrorMode.INTERRUPT_SUITE;
	this.asyncErrorBehaviour = asyncErrorBehaviour || runner.config.asyncErrorBehaviour || Suite.asyncErrorBehaviour.INTERRUPT;
		
	const interruptOnAsyncErr = !(this.asyncErrorMode === Suite.asyncErrorMode.ALLOW_TO_FAIL
		&& this.asyncErrorBehaviour === Suite.asyncErrorBehaviour.CONTINUE)

	this.emitter = new Emitter('asyncReady asyncFail', this);
	const fpath = _getCallerFile();
	this.name = fpath;
	const asyncJobs = [];
	const asyncLock = [];
	let testBlock = () => {};
	let emergeBlocks = [];
	this.status = {
		async: undefined,
		test: undefined,	
	}
	this.executionContext = {};


	const self = this;

	this.on = (...args) => this.emitter.on(...args);
	this.off = (...args) => this.emitter.off(...args);

	//Adding suite to runner;
	if (runner)
		runner.addSuite(this);

	// -- Global -- //
	if (global.MIconsistency === false)
		runner.error("", new MIError(`Suites encapsulation detected in suite ${fpath}`));
	//Consistency var prevents suites incapsulation
	MIconsistency = false;
	/**
	 * Function that register async block, that has to be preloaded before mocha tests run
	 * Each Suite instance redefines it in global scope to properly handle code parts
	 * @param {Function|String} name
	 * @param {Function} func
	 */
	asyncJob = function(name, func, config) {
		let job = {};
		job = (name instanceof Function) ? new AsyncJob(self, fpath, name, func) : new AsyncJob(self, name, func, config);
		asyncJobs.push(job);
		return job;
	}

	scope = async function(scope, func) {
		const scopes = (scope instanceof Array) ? scope : scope.split(' ');
		if (global.suite === "all" || scopes.includes(global.suite)) {
			await func();
		}
	}
	//TODO all -> default, refactor
	main = function(func, config) {
		testBlock = (context) => (config && config.scope) ? scope(config.scope, () => func(context)) : func(context);
		if (self.testBlock)
			runner.error("", new MIError(`main() blocks encapsulation detected in suite ${fpath}`));
	}
	
	emerge = function (func) {
		emergeBlocks.push(func);
	}	
	// -- End global -- //


	this.runAsyncs = async function() {
		asyncLock.push(...asyncJobs.filter(j => j.status === AsyncJob.status.NOT_STARTED));
		for (let job of asyncLock) {
			let error = undefined;
			function onFail(err) {
				error = err;
				if (interruptOnAsyncErr || err instanceof MIError)
					self.status.async = false;
				job.off("fail", onFail);	
			}
			job.on("fail", onFail);
			await job.run();
			if (this.status.async === false && interruptOnAsyncErr || error instanceof MIError) {
				self.emitter.emit("asyncFail", error);
				if (error instanceof MIError)
					throw error;
				return;
			}
		}
		if (this.status.async === undefined)
			this.status.async = true;
		this.emitter.emit("asyncReady");
	}

	this.run = function() {
		//TODO config mocha auto-wrap
		global.suiteEpic = this.epic;
		global.suiteFeature = this.feature;
		try {
			testBlock(self.executionContext);
		} catch (err) {
			runner.error(`Error ocurred during building mocha for "${this.name}". Run interrupted. Here's an error:`, err);
		}
		delete global.suiteEpic;
		delete global.suiteFeature;
	}

	this.emerge = function() {
		for (let block of emergeBlocks) {
			try {
				block(this.executionContext);
			} catch (_) {}
		}
	}

	this.getAsyncs = function() { return asyncJobs; }

	this.ready = function() { return this.status.async !== undefined; }
	
	try {
		func();
	} catch (err) {
		runner.error(`Error ocurred during parsing suite "${this.name}". Run interrupted. Here's an error:`, err);
	}

	MIconsistency = true;

	return this;	
} 

Suite.asyncErrorMode = {
	ALLOW_TO_FAIL: 0,
	INTERRUPT_SUITE: 1,
	INTERRUPT_RUN: 2	
}
Suite.asyncErrorBehaviour = {
	CONTINUE: 0,
	INTERRUPT: 1
}
Suite.prototype = {
	constructor: Suite
}

function _getCallerFile() {
	var originalFunc = Error.prepareStackTrace;
	var callerfile;
	try {
		var err = new Error();
		var currentfile;
		Error.prepareStackTrace = function (err, stack) { return stack; };
		currentfile = err.stack.shift().getFileName();
		while (err.stack.length) {
			callerfile = err.stack.shift().getFileName();
			if(currentfile !== callerfile && !callerfile.endsWith('/Runner.js')) break;
		}
	} catch (e) {}
	Error.prepareStackTrace = originalFunc; 
	return callerfile.split('/').pop();
}

module.exports = Suite
