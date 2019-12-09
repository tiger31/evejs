const Runner = require('../../lib/classes/Runner');

describe('Runner (Common)', () => {
	it('Create runner', () => {
		const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', pattern: "*.test.js" }});
	});
	describe('Exports', () => {
		it('Add suite', () => {
			const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', pattern: "*.test.js" }});
			runner.mi('Suite', () => {}, {});
			chai.expect(runner.MISuites).to.have.lengthOf(1);
			chai.expect(runner.MISuites).to.include.property('0')
				.and.to.include.property('name', 'Suite')
		});
		it('Add seed', () => {
			const runner = new Runner({ test: { dir: 'test/Runner/filesIncluding/tests', pattern: "*.test.js" }});
			runner.seed('Seed', (context) => { context.a = 1 });
			chai.expect(runner.seeds).to.have.lengthOf(1);
			chai.expect(runner.seeds).to.include.property('0')
				.and.to.include.property('name', 'Seed')
		})
	});

	describe('Filters inheritance', () => {
		const data = [
			{
				parent: { epic: "a" },
				child: { feature: "b" },
				throws: false,
				result: { epic: 'a', feature: 'b' }
			},
			{
				parent: { epic: "a" },
				child: { feature: "b", story: 'c' },
				throws: false,
				result: { epic: 'a', feature: 'b', story: 'c' }
			},
			{
				parent: { epic: "a", feature: 'b'},
				child: {  },
				throws: false,
				result: { epic: 'a', feature: 'b' }
			},
			{
				parent: { feature: "a" },
				child: { feature: 'a' },
				throws: false,
				result: { feature: 'a' }
			},
			{
				parent: { story: "a" },
				child: { feature: 'a' },
				throws: true,
			},
			{
				parent: { epic: "a", feature: "b", story: "c" },
				child: { epic: 'd' },
				throws: true,
			},
			{
				parent: { epic: "a", feature: "b", story: "c" },
				child: { story: 'f' },
				throws: true,
			},
			{
				parent: { epic: "a", story: "c" },
				child: { feature: 'f' },
				throws: true,
			},
		];
		for (const sample of data)
			it(`Sample`, () => {
				if (sample.throws) {
					chai.expect(() => Runner._inherit(sample.child, sample.parent)).to.throw(errors.MITestsTreeError)
				} else {
					chai.expect(Runner._inherit(sample.child, sample.parent)).to.include(sample.result)
				}
			})
	})
});