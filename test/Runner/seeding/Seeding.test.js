const Runner = require('../../../lib/classes/Runner');
const Suite = require('../../../lib/classes/Suite');

describe('Runner seeding', () => {
	it('Allow to fail', async () => {
		const runner = new Runner({test: {dir: 'test/Runner/seeding/tests', pattern: "*.suite.js"}});
		runner.unloadTestFiles();
		runner.MISuites[0].config.mode = Suite.mode.ALLOW_TO_FAIL;
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites[0].context).to.include({a: 1})
	});
	it('Interrupt suite', async () => {
		const runner = new Runner({test: {dir: 'test/Runner/seeding/tests', pattern: "*.suite.js"}});
		runner.unloadTestFiles();
		runner.MISuites[0].config.mode = Suite.mode.INTERRUPT_SUITE;
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites[0].runnables).to.have.lengthOf(0)
	});
	it('Interrupt run', async () => {
		const runner = new Runner({test: {dir: 'test/Runner/seeding/tests', pattern: "*.suite.js"}});
		runner.unloadTestFiles();
		runner.MISuites[0].config.mode = Suite.mode.INTERRUPT_RUN;
		await chai.expect(runner.run()).to.be.rejected;
	})
});