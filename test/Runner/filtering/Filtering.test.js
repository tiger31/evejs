const Runner = require('../../../lib/classes/Runner');

describe('Runner filtering', () => {
	it('Common example', async () => {
		const runner = new Runner({
			test: { dir: 'test/Runner/filtering/tests', pattern: '*.a.js' }
		});
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.property('config')
			.and.include({epic: 'Epic'});
		chai.expect(runner.MISuites).to.include.property('0')
			.and.nested.include.property('suites[0]')
			.and.include.property('config')
			.and.include({epic: 'Epic', feature: 'Feature'});
		chai.expect(runner.MISuites).to.include.property('0')
			.and.nested.include.property('tests[0]')
			.and.include.property('config')
			.and.include({epic: 'Epic', story: 'Story 1'});
		chai.expect(runner.MISuites).to.include.property('0')
			.and.nested.include.property('suites[0]')
			.and.nested.include.property('tests[0]')
			.and.include.property('config')
			.and.include({epic: 'Epic', feature: 'Feature', story: 'Story 2'});
	});
	it('Rejected because of broken tree', async () => {
		const runner = new Runner({
			test: { dir: 'test/Runner/filtering/tests', pattern: '*.b.js' }
		});
		await chai.expect(runner.run()).to.be.rejectedWith(errors.MITestsTreeError);
	});
	it('Run only "Story 2"', async () => {
		const runner = new Runner({
			test: { dir: 'test/Runner/filtering/tests', pattern: '*.c.js'}, filters: { story: 'Story 2' }
		});
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.nested.include.property('suites[0]')
			.and.nested.include.property('tests[0]')
			.and.include.property('config')
			.and.include({epic: 'Epic', feature: 'Feature', story: 'Story 2'});
	});
	it('Run only "Feature"', async () => {
		const runner = new Runner({
			test: { dir: 'test/Runner/filtering/tests', pattern: '*.d.js'}, filters: { feature: 'Feature' }
		});
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.property('suites')
			.and.have.lengthOf(2);
	});
	it('Run Epic/Story', async () => {
		const runner = new Runner({
			test: { dir: 'test/Runner/filtering/tests', pattern: '*.e.js'}, filters: { epic: 'Epic', story: 'Story' }
		});
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.property('suites')
			.and.have.lengthOf(2);
	})
});