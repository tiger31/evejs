const runner = require('../../index.js');

global.chai = require('chai');

chai.use(require('chai-as-promised'));

global.expect = chai.expect;
global.axios = require('axios');

const r = new runner({ follow: true });
r.run();
