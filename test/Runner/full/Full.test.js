const Runner = require('../../../lib/classes/Runner');

describe('Runner files including', () => {
	it('Including single file', async () => {
		const runner = new Runner({ test: { dir: 'test/Runner/full/tests', pattern: "*.mi.js" }});
		await chai.expect(runner.run()).to.not.be.rejected;
	}).timeout(5000)
});
