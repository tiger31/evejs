const Stacktrace = require('callsite-record');
const chalk = require('chalk');

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

module.exports = Stacktrace;
