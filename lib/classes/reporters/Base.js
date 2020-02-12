const Reporter = require('../abstract/Reporter');
const Stacktrace = require('callsite-record');
const Test = require('../Test.new');
const utils = require('../../utils');
const sep = require('path').sep;
const node = `${sep}node_modules${sep}`;

const marks = {
	[Test.states.PASSED]: Reporter.modify('✓', ['green']),
	[Test.states.FAILED]: Reporter.modify('✕', ['red']),
	[Test.states.PENDING]: Reporter.modify('↓', ['blue']),
	[Test.states.BROKEN]: Reporter.modify('✕', ['yellow']),
};

module.exports = class BaseReported extends Reporter {
	inclusionIndex = 0;
	spacer = '  ';
	errors = [];

	constructor(runner) {
		super(runner);
		this.attach();
		this.runner.on(this.runner.constructor.events.EVENT_STATE_FRAMEWORK_END, this.flushErrors);
	}

	/**
	 * @override
	 */
	test = (test) => {
		this._test(test);
	};

	_filter = (frame) => {
		const fileName = frame.getFileName();
		return fileName.indexOf(sep) > -1 && fileName.indexOf(node) === -1;
	};

	_test = (test) => {
		let error = '';
		if (test.state === Test.states.FAILED || test.state === Test.states.BROKEN) {
			error = ` ${this.constructor.modify(`[${this.errors.push(test.error)}]`, ['red'])}`
		}
		this.print(`${marks[test.state]}${error} ${test.title} (${Math.round(test.timing || 0)}ms)`);
	};

	suite = {
		/**
		 * @override
		 */
		begin: (suite) => {
			this.print(suite.title);
			this.inclusionIndex++;
		},
		/**
		 * @override
		 */
		end: (suite) => {
			this.inclusionIndex--;
		}
	};

	print = (str, index) => {
		const s = str.padStart(str.length + ((index || this.inclusionIndex) * this.spacer.length), this.spacer);
		console.log(s);
	};

	flushErrors = () => {
		for (let i = 0; i < this.errors.length; i++) {
			console.log();
			const error = this.errors[i];
			const message = `${this.constructor.modify(`ERROR ${i + 1}`, ['bg_red'])} ${this.constructor.modify(error.name, ['bold'])}: ${error.message}`;
			const trace = Stacktrace({ forError: error, byFunctionName: 'test' }).renderSync({ stackFilter: this._filter, frameSize: 2 });
			message.split('\n').forEach(s => this.print(s));
			console.log();
			trace.split('\n').forEach(s => this.print(s));
		}
	}
};