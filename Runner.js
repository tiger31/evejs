const Suite = require('./Suite.js');
const AsyncJob = require('./AsyncJob.js')
const Monitor = require('./Monitor.js');
const Logger = require('./Logger.js')
const MIErr = require('./MIError.js');
const Colors = require('./Colors.js');
const Emitter = require('./EventEmitter.js');
const MochaFollower = require('./MochaFollower.js');
const Serializable = require('./Serializable.js');

const MIrc = require('./MIrc.js');

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Mocha = require('mocha');

const constants = {
	EVENT_MI_CLASS_REQUIRE: "class-require",
	EVENT_MI_CLASSES_LOADED: "classes-loaded",
	EVENT_MI_MOCHA_RUNNER: "mocha-runner"
}

MIError = MIErr;

//TODO Events
function Runner(config) {
	MIRunner = this;
	MISuite = (func, config) => new Suite(func, config);
	MILogger = this.logger = new Logger("Info");
	this.emitter = new Emitter(Object.values(constants).join(' '), this);
	this.root = path.dirname(require.main.filename);

	this.mochaRunner = undefined;

	this.files = [];
	this.suites = [];
	
	//TODO consts
	global.scenario = "all";
	global.suite = "all";

	this.config = Object.assign({}, MIrc, config || {});
	if (this.config.mochaOptions && this.config.mochaOptions.delay !== undefined)
		delete this.config.mochaOptions.delay;

	this.args();

	this.mochaRunner = new Mocha(this.config.mochaOptions);
	this.mochaRunner.delay();


	this.on = (...args) => this.emitter.on(...args);
	this.off = (...args) => this.emitter.off(...args);

	if (this.config.follow)
		this.follower = new MochaFollower(this);
}

Runner.prototype.exit = function(code) {
	console.log(code);
	try {
		this.suites.forEach(suite => suite.emerge());
	} catch (_) {}
	this.logger.registerModule(this.asLoggerModule(code));
	fs.writeFileSync(`${this.root}/log.json`, this.logger.serialize());
	//TODO Logger here
	process.exit(code || 0);
}

Runner.prototype.error = function(message, err) {
	this.logger.fatal({ message: message, error: err })
	this.exit(1);
}

Runner.prototype.asLoggerModule = function module(exitCode) {
	const self = this;
	return Object.assign(Object.create(Serializable.prototype), {
		name: "runner",
		serialize() {
			return {
				config: self.config,
				scenario: global.scenario,
				suite: global.suite,
				exitCode: exitCode,
				date: moment().valueOf()
			}
		}
	})
}

Runner.prototype.args = function() {
	const argv = require('yargs').argv;
	if (argv.c || argv.check) {
		this.logger.debug({ prefix: ["STARTUP"], message: `No test will be run, working in check mode`});
		this.exit((argv.scenario && !Object.values(this.config.scenarios).includes(argv.scenario)) ? 0 : 1);
	}
	//Suite
	if (!argv.suite)
		global.suite = "all";
	else if (this.config.suites.includes(argv.suite)) 
		global.suite = argv.suite;
	else {
		if (argv.f)
			this.logger.warning({ prefix: ["STARTUP"], message: `Undefined suite '${argv.suite}'. Fallback to all`});
		else 
			this.error(`Undefined suite '${argv.suite}'. No fallback`);
	}
	//Scenario
	if (!argv.scenario)
		global.scenario = "all";
	else if (Object.values(this.config.scenarios).includes(argv.scenario)) 
		global.scenario = argv.scenario;
	else {
		if (argv.f)
			this.logger.warning({ prefix: ["STARTUP"], message: `Undefined scenario '${argv.scenario}'. Fallback to all`});
		else 
			this.error(`Undefined scenario '${argv.scenario}'. No fallback`);
	}
}

Runner.prototype.includeClasses = function() {
	const path = `${this.root}/${this.config.includePath}`;
	//TODO check not dir
	if (!fs.existsSync(path)) {
		this.logger.warning({ prefix: ["STARTUP"], message: `Include path ${this.config.includePath} does not exists` });
		return;	
	}
	this.logger.info({ prefix: ["STARTUP"], message: "Scanning for classes to auto include" });
	const filesArr = fs.readdirSync(path);
	const included = [];
	for (let classfile of filesArr) {	
		const file = `${path}/${classfile}`;
		const info = fs.statSync(file);
		if (!info.isDirectory() && classfile.substr(-3) === '.js') {
			included.push(file);
			try {
				this.emitter.emit(constants.EVENT_MI_CLASS_REQUIRE, global[classfile.substr(0, classfile.length - 3)] = require(file));
			} catch (err) {
				this.error("Failed to include class", err);
			}
		}
	}
	this.emitter.emit(constants.EVENT_MI_CLASSES_LOADED);
	this.logger.list({ prefix: ["STARTUP"], message: "List of files", data: included });
}

Runner.prototype.loadFiles = function() {
	//Bind mocha files var to MI files var. Files are allways will be the same
	this.mochaRunner.files = this.files;
	//TODO "all" to some constants
	if (global.scenario === "all") {
		this.logger.info({ prefix: ["STARTUP"], message: `${(this.config.recursive) ? "Recursively scanning" : "Scanning"} dirrectory '${this.config.testDir}' for files with postfix '${this.config.postfix}'`});
		const queue = [];
		const path = `${this.root}/${this.config.testDir}`;
		if (!fs.existsSync(path)) {
			this.error(`Tests direcory ${path} does not exists`);
			return;	
		}
		queue.push(path);
		while (queue.length > 0) {
			const file = queue.shift();
			const info = fs.statSync(file);
			if (info.isDirectory() && this.config.recursive) {
				queue.push(...fs.readdirSync(file).map(filename => `${file}/${filename}`));
			} else if (info.isFile()) {
				if (!this.config.postfix || (this.config.postfix && file.endsWith(this.config.postfix)))
					this.files.push(file);
			}
		}
	} else { //TODO test this part
		this.logger.info({ prefix: ["STARTUP"], message: `List of files for scenario "${global.scenario}" is loaded from config` })
		const arr = this.config.scenariosFiles[global.scenario] || [];
		for (let file of arr) {
			const filePath = `${this.root}/${file}`;
			if (!fs.existsSync(filePath)) {
				this.error(`Scenario file ${filePath} does not exists`);
				return;	
			}
			const filename = file.substr(- file.length + file.lastIndexOf("/") + 1);
			this.files.push(filePath);
		}
	}
	if (this.files.length === 0) {
		this.logger.warning({ prefix: ["STARTUP"], message: "Zero files found"})
		this.exit(0);
	}
	this.logger.list({ prefix: ["STARTUP"], message: "List of files:", data: this.files});
}

Runner.prototype.addSuite = function (suite) {
	if (suite instanceof Suite)
		this.suites.push(suite);
}

Runner.prototype.startAsyncs = async function() {
	this.logger.title("Async jobs");
	const monitor = new Monitor(this.suites);
	await Promise.all(this.suites.map(suite => suite.runAsyncs()))
		.catch(async (err) => { await monitor.destroy(); throw err; })
	await monitor.destroy();
	//Filtering failed jobs;
	const failedJobs = this.suites.reduce((arr, suite) => {
		arr.push(...suite.getAsyncs().filter(job => job.status === AsyncJob.status.FAILED))
		return arr;
	}, []);
	this.logger.title((failedJobs.length === 0) ? "Async done"	: "Async done with errors");
	failedJobs.forEach(job => this.logger.error({ prefix: ["ASYNC"], message: `${job.suite.name} -> ${job.name}`, error: job.err }));
}

Runner.prototype.runSuites = function() {
	if (this.suites.some(suite => suite.status.async === false 
		&& suite.asyncErrorMode === Suite.asyncErrorMode.INTERRUPT_RUN)) {
		this.error(`INTERRUPT_RUN caught (see suites with flag S*)`);
	}
	const suitesToRun = this.suites.filter(suite => (suite.status.async 
		|| suite.status.async === false && suite.asyncErrorMode === Suite.asyncErrorMode.ALLOW_TO_FAIL));
	this.logger.list({ message: "List of suites to be run", data: suitesToRun.map(suite => suite.name) });
	suitesToRun.forEach((suite) => {
		suite.run();	
	});
}

Runner.prototype.run = async function() {
	console.log(this.config.hello);
	this.includeClasses();
	this.loadFiles();	
	try {
		this.emitter.emit(constants.EVENT_MI_MOCHA_RUNNER, this.mochaRunner = this.mochaRunner.run((err) => { 
			this.logger.title("Mocha end");
			if (err) this.exit(1);
			this.exit(0);
		}));
		this.follower && this.follower.attach();
	} catch (err) {
		this.error("Error ocurred during require files in Mocha. Run interrupted", err);
	}
	await this.startAsyncs();
	this.runSuites();
	MISuite = () => { this.error("", new MIError("Encapsulation detected in delayed-run part")) };
	this.logger.title("Mocha");
	run();
}

module.exports = Runner;
