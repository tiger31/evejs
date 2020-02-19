const Runner = require('./lib/classes/Runner');
const Suite = require('./lib/classes/Suite');
const Test = require('./lib/classes/Test');
const errors = require('./lib/errors');

module.exports = Runner;
module.exports.Suite = Suite;
module.exports.Test = Test;
module.exports.errors = errors;

