const mocha = require('mocha');
const runner = new mocha();
require('mocha-steps');
runner.delay().run();
run();