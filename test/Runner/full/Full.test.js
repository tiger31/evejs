const Runner = require('../../../lib/classes/Runner');
const Suite = require('../../../lib/classes/Suite');
const TestSuite = require('../../../lib/classes/TestSuite');
const Test = require('../../../lib/classes/Test');

describe('Runner files including', () => {
	it('Including single file', async () => {
		const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', pattern: "*.mi.js" }});
		await chai.expect(runner.run()).to.not.be.rejected;
	})
});
