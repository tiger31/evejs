const Runner = require('../../lib/classes/Runner');

describe('Runner (Common)', () => {
	it('Create runner', () => {
		const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', patter: "*.test.js" }});
	});
	describe('Exports', () => {
		it('Add suite', () => {
			const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', patter: "*.test.js" }});
			runner.mi('Suite', () => {}, {});
			chai.expect(runner.MISuites).to.have.lengthOf(1);
			chai.expect(runner.MISuites).to.include.property('0')
				.and.to.include.property('name', 'Suite')
		});
		it('Add seed', () => {
			const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', patter: "*.test.js" }});
			runner.seed('Seed', (context) => { context.a = 1 });
			chai.expect(runner.seeds).to.have.lengthOf(1);
			chai.expect(runner.seeds).to.include.property('0')
				.and.to.include.property('name', 'Seed')
		})
	});
});