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
		'no-param-reassign': 2,
		'prefer-promise-reject-errors': 2,
		'no-undefined': 2,
		'callback-return': 2,
		'handle-callback-err': 2,
		'array-bracket-spacing': [
			'error',
			'always',
		],
		'max-lines-per-function': [
			'warn',
			{ max: 30, skipComments: true }
		],
		'max-nested-callbacks': [
			'warn',
			3
		],
		'no-lonely-if': 2,
		'no-multiple-empty-lines': 2,
		'object-curly-spacing': 2,
		'arrow-parens': [
			"error", "as-needed", { "requireForBlockBody": true }
		],
		'arrow-spacing': [
			"error", { before: true, after: true }
		],
		'no-useless-rename': 2,
		'no-var': 2,
		'prefer-arrow-callback': 2,
		'prefer-const': 2,
		'prefer-template': 2,
		'babel/semi': 1
	}
};