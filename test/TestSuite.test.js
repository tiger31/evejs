const TestSuite = require('../lib/classes/Suite');
const Test = require('../lib/classes/Test');


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
		chai.expect(s.suites).to.have.lengthOf(1);
		chai.expect(s.suites).to.include.property('0')
			.and.include.property('name', 'Suite');
		chai.expect(s.tests).to.have.lengthOf(1);
		chai.expect(s.tests).to.include.property('0')
			.and.include.property('name', 'Test');
	});
	it('Run single test', async () => {
		const s = new TestSuite({fn: () => {
				test("Test", () => {});
			}, name: "TestSuite", context: {}, runner: {
				filter: (scope, parent, fn) => fn(),
		}});
		s.run();
		await chai.expect(new Promise((rs, rj) => {
			s.run().then(rs).catch(rj);
		})).to.not.be.rejected;
		chai.expect(s.tests[0].state).to.be.equal(Test.states.PASSED);
	});
	it('Hook sequence', async () => {
		const arr = [];
		const s = new TestSuite({fn: () => {
				before(() => { arr.push('b'); });
				beforeEach(() => { arr.push('be'); });
				after(() => { arr.push('a'); });
				afterEach(() => { arr.push('ae'); });
				test("Test", () => { arr.push('t') });
			}, name: "TestSuite", context: {}, runner: {
				filter: (scope, parent, fn) => fn(),
		}});
		await chai.expect(new Promise((rs, rj) => {
			s.run().then(rs).catch(rj);
		})).to.not.be.rejected;
		chai.expect(arr).to.have.members(['b', 'be', 't', 'ae', 'a']);
	});
	it('Skip flag', async () => {
		const s = new TestSuite({fn: () => {
				test('Failed', () => { throw new Error('error') }, { step: true });
				test("Test", () => {});
			}, name: "TestSuite", context: {}, runner: {
				filter: (scope, parent, fn) => fn(),
			}});
		await chai.expect(new Promise((rs, rj) => {
			s.run().then(rs).catch(rj);
		})).to.not.be.rejected;
		chai.expect(s.tests).to.include.property('1')
			.and.include.property('state', Test.states.PENDING);
	})
});