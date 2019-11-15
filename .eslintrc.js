module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es6': true
	},
	'parser': 'babel-eslint',
	'plugins': [
		'babel'
	],
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'babel/semi': 1
	}
};