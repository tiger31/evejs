const Reporter = require('../abstract/Reporter');
const Stacktrace = require('callsite-record');
const Test = require('../Test');
const Suite = require('../Suite');
const sep = require('path').sep;
const node = `${sep}node_modules${sep}`;
const chalk = require('chalk');
const ms = require('ms');
const errors = require('../../errors');

Stacktrace.renderers.default.syntax = {
	string:     chalk.green,
	punctuator: chalk.dim,
	keyword:    chalk.cyan,
	number:     chalk.magenta,
	regex:      chalk.magenta,
	comment:    chalk.dim.bold,
	invalid:    chalk.inverse
};

Stacktrace.renderers.default.stackLine = function (name, location, isLast) {
	let line = '   at ' + chalk.bold(name) + ' (' + chalk.dim.underline(location) + ')';
		line += '\n';
	return line;
};

const marks = {
	[Test.states.PASSED]: chalk.green('✓'),
	[Test.states.FAILED]: chalk.red('✕'),
	[Test.states.PENDING]: chalk.blue('↓'),
	[Test.states.BROKEN]: chalk.yellow('✕'),
};

const states = {
	[Test.states.PASSED]: chalk.green.bold,
	[Test.states.FAILED]: chalk.red.bold,
	[Test.states.PENDING]: chalk.blue.bold,
	[Test.states.BROKEN]: chalk.yellow.bold,
};

module.exports = class BaseReporter extends Reporter {
	inclusionIndex = 0;
	spacer = '  ';
	errors = [];
	path = [];
	parallel;

	constructor(runner) {
		super(runner);
		this.attach();
	}

	attach() {
		super.attach();
		this.runner.on(this.runner.constructor.events.EVENT_STATE_FRAMEWORK_END, this.flushErrors);
		this.runner.on(Suite.events.SUITE_PARALLEL_BEGIN, this.suite.parallel.begin);
		this.runner.on(Suite.events.SUITE_PARALLEL_END, this.suite.parallel.end);
	}

	/**
	 * @override
	 */
	test = (test) => {
		if (!this.parallel)
			this._test(test);
	};

	_filter = (frame) => {
		const fileName = frame.getFileName();
		return fileName.indexOf(sep) > -1 && fileName.indexOf(node) === -1;
	};

	_test = (test) => {
		let error = '';
		if (test.state === Test.states.FAILED || test.state === Test.states.BROKEN) {
			this.path.push(this._retrievePath(test));
			error = ` ${chalk.red('[' + this.errors.push(test.error) + ']')}`
		}
		this.print(`${marks[test.state]}${error} ${chalk.dim(test.title)} (${ms(Math.round(test.timing || 0))})`);
	};

	suite = {
		/**
		 * @override
		 */
		begin: (suite) => {
			if (!this.parallel) {
				if (suite.state === Test.states.PENDING) {
					this.print(`${marks[suite.state]} ${suite.title}`)
				} else {
					this.print(suite.title);
				}
				this.inclusionIndex++;
			}
		},
		/**
		 * @override
		 */
		end: (suite) => {
			if (!this.parallel)
				this.inclusionIndex--;
		},
		parallel: {
			begin: (suite) => {
				if (!this.parallel) {
					this.parallel = suite;
					this.print(chalk.bold(`${chalk.bgWhite('Parallel')} execution started`));
				}
			},
			end: (suite) => {
				if (this.parallel === suite) {
					this._restoreParallel(suite);
					this.print(chalk.bold(`${chalk.bgWhite('Parallel')} execution ended`));
				}
			}
		}
	};

	_retrievePath(test) {
		const arr = [];
		let runnable = test;
		while (runnable.parent) {
			arr.push(runnable.title);
			runnable = runnable.parent;
		}
		return arr;
	}

	_restoreParallel = (suite) => {
		this.parallel = null;
		this._restoreRunnables(suite.parallels);
	};

	_restoreRunnables = (runnables) => {
		for (let runnable of runnables) {
			if (runnable instanceof Suite)
				this._restoreSuite(runnable);
			else
				this._restoreTest(runnable);
		}
	};

	_restoreSuite = (suite) => {
			this.suite.begin(suite);
			if (suite.state !== Test.states.PENDING)
				this._restoreRunnables(suite.runnables);
			this.suite.end(suite);
	};

	_restoreTest = (test) => {
		this.test(test);
	};

	print = (str, index) => {
		const s = str.padStart(str.length + ((index || this.inclusionIndex) * this.spacer.length), this.spacer);
		console.log(s);
	};

	_summary = (arr) => {
		return Object.keys(arr)
			.filter(v => arr[v])
			.map((v) => states[v](`${arr[v]} ${v.toLowerCase()}`));
	};

	summary = () => {
		const length = 10;
		const suites = this._summary(this.runner.stats.summary.suites);
		suites.push(`${Object.values(this.runner.stats.summary.suites).reduce((s, v) => s + v, 0)} total`);
		const tests = this._summary(this.runner.stats.summary.tests);
		tests.push(`${Object.values(this.runner.stats.summary.tests).reduce((s, v) => s += v, 0)} total`);
		console.log(chalk.bold('Suites: '.padEnd(length, ' ')) + suites.join(', '));
		console.log(chalk.bold('Tests: '.padEnd(length, ' ')) + tests.join(', '));
		console.log(chalk.bold('Time: '.padEnd(length, ' ')) + ms(Math.round(this.runner.timing)));
	};

	flushErrors = () => {
		for (let i = 0; i < this.errors.length; i++) {
			console.log();
			const error = this.errors[i];
			const message = `${this.constructor.modify(`ERROR ${i + 1}`, ['bg_red'])} ${this.constructor.modify(error.name, ['bold'])}: ${error.message}`;
			//const stack = (error instanceof errors.MITimeoutError) ? Stacktrace({})
			const trace = Stacktrace({ forError: error }).renderSync({ stackFilter: this._filter, frameSize: 2 });
			const path = this.path[i];
			for (let j = path.length - 1; j >= 0; j--) {
				this.print(path[j]);
				this.inclusionIndex++;
			}
			message.split('\n').forEach(s => this.print(s));
			console.log();
			trace.split('\n').forEach(s => this.print(s));
			this.inclusionIndex = 0;
		}
		console.log();
		this.summary();
	}
};