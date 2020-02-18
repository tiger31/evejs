#!/usr/bin/env node
const Runner = require('../lib/classes/Runner');

const argv = require('yargs')
	.options({
		d: {
			alias: 'directory',
			default: 'tests',
			describe: 'Directory with tests',
			type: 'string',
			group: 'Config'
		},
		p: {
			alias: ['pattern', 'glob'],
			default: '*.test.js',
			describe: 'Pattern of test file names',
			type: 'string',
			group: 'Config'
		},
		t: {
			alias: 'timeout',
			default: 2000,
			describe: 'Default tests timeout',
			type: 'number',
			group: 'Config'
		},
		s: {
			alias: 'scope',
			default: ['all'],
			describe: 'Runner filtering scope',
			type: 'array',
			group: 'Filter'
		},
		e: {
			alias: 'epic',
			describe: 'Epics to be run',
			type: 'array',
			group: 'Filter'
		},
		f: {
			alias: 'feature',
			describe: 'Features to be run',
			type: 'array',
			group: 'Filter'
		},
		story: {
			describe: 'Stories to be run',
			type: 'array',
			group: 'Filter'
		},
		r: {
			alias: 'reporter',
			choices: Runner.reporters,
			describe: 'Reporter',
			default: 'default',
			group: 'Config'
		}
	}).argv;

console.log(argv);