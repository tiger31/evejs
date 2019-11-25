global.errors = require('../lib/errors');
global.chai = require('chai');
chai.use(require('chai-as-promised'));

require('mocha-steps');

process.setMaxListeners(9999);

global.timeout_f = (timeout, resolve, value) => () => new Promise((rs, rj) => {
	setTimeout(() => {
		(resolve) ? rs(value) : rj(value);
	}, timeout)
});

global.delayed = (fn, timeout) => (context) => new Promise((rs, rj) => {
	setTimeout(async () => { await fn(context); rs(); }, timeout)
});

