const TestSuite = require('../lib/classes/TestSuite');


describe("TestSuite", () => {
	it ("Create TestSuite instance", () => {
		const suite = new TestSuite({fn: () => {}, name: "TestSuite", context: {}, runner: {
			driver: { suite: () => {}, test: () => {}},
			scope: (scope, fn) => fn()
		}})
	});
	it('Add nested suite and test', () => {
		const s = new TestSuite({fn: () => {
			suite("Suite", () => {});
			test("Test", () => {});
		}, name: "TestSuite", context: {}, runner: {
			filter: (scope, parent, fn) => fn(),
		}});
		chai.expect(s.errors).to.be.empty;
		chai.expect(s.runnables).to.have.lengthOf(2);
		chai.expect(s.suites).to.have.lengthOf(1);
		chai.expect(s.suites).to.include.property('0')
			.and.include.property('name', 'Suite');
		chai.expect(s.tests).to.have.lengthOf(1);
		chai.expect(s.tests).to.include.property('0')
			.and.include.property('name', 'Test');
	});
	it('Hooks sequence', async () => {
		const arr = [];
		const BT = () => arr.push('BT');
		const BTS = () => arr.push('BTS');
		const AT = () => arr.push('AT');
		const ATS = () => arr.push('ATS');
		const s = new TestSuite({fn: () => {
			beforeTests(BTS);
			beforeTest(BT);
			afterTests(ATS);
			afterTest(AT);
			suite('A', () => {
				beforeTests(BTS);
				beforeTest(BT);
				afterTests(ATS);
				afterTest(AT);
				test('C', () => {})
			});
			test('B', () => {})
		}, name: "Suite", runner: { driver: {test: () => {}, suite: () => {}}, filter: (scope, parent, fn) => fn()}, context: {}});
		await chai.expect(s.run()).to.not.be.rejected;
		chai.expect(s.errors).to.be.empty;
		chai.expect(arr).to.have.ordered.members(['BTS', 'BT', 'BTS', 'BT', 'AT', 'ATS', 'AT', 'BT', 'AT', 'ATS'])
	})
});