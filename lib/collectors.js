const Collector = require('./classes/Collector');
const utils = require('./utils');

const config = module.exports.config = new Collector('config', [
	{field: 'timeout', as: 'timeout'},
	{field: 'parallel', as: 'parallel'},
	{field: 'step', as: 'step'},
	{field: 'skip', as: 'skip'},
]);

const filter = module.exports.filter = { field: 'filterConfig', as: 'filter', transform: (f) => { delete f.shadowed; return f; } };

const entity = module.exports.entity = [
	'title',
	'state',
	{field: 'parent._uuid', as: 'parentId' },
	{field: 'runner._uuid', as: 'runId' },
	'timing',
];

const runConfig = new Collector('config', [
	{field: 'config.reporter', as: 'reporter'},
	{field: 'config.scope', as: 'scope'},
	{field: 'config.epic', as: 'epic'},
	{field: 'config.feature', as: 'feature'},
	{field: 'config.story', as: 'story'},
	{field: 'config.dir', as: 'dir'},
	{field: 'config.pattern', as: 'pattern'}
]);

const tree = module.exports.tree = new Collector('tree', [
	{field: 'suites', as: 'suites', transform: (suites) => suites.map(s => s.collected)},
	{field: 'tests', as: 'tests', transform: (tests) => tests.map(s => s.collected)},
]);

module.exports.Test = new Collector('test', [
	...entity,
	{ field: 'error', as: 'error', transform: utils.errorToOj },
	config,
	filter
]);

module.exports.Suite = new Collector('suite', [
	...entity,
	config,
	filter,
	tree,
	'stats'
]);

module.exports.Run = new Collector('run', [
	...entity,
	{ field: '_error', as: 'error', transform: utils.errorToOj },
	tree,
	runConfig,
	'created',
	'stats'
]);
