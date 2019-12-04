const Runner = require('../../../lib/classes/Runner');

describe('Runner error handling', () => {
	it('Seed config undefiled variable', () => {
		const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests", pattern: "*.seedconf1.js" }});
		chai.expect(runner).to.throw(ReferenceError);
	});
	it('Seed config not an object', () => {
		const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests", pattern: "*.seedconf2.js" }});
		chai.expect(runner).to.throw(TypeError);
	});
});