const Runner = require('../../../lib/classes/Runner');
const Suite = require('../../../lib/classes/Suite');
const TestSuite = require('../../../lib/classes/TestSuite');
const Test = require('../../../lib/classes/Test');

describe('Runner files including', () => {
	it('Including single file', () => {
		const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', pattern: "*.mi.js" }});
		chai.expect(runner.MISuites).to.have.lengthOf(1);
		chai.expect(runner.MISuites).to.include.property('0')
			.and.to.be.instanceOf(Suite)						//Suite
			.and.include({name: 'Suite'})
			.and.include.property('runnables')
			.and.not.include.property('0')
	})
});