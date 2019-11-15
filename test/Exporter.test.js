const Exporter = require('../lib/classes/abstract/Exporter');
const chai = require('chai');

describe("Exporter abstract class", () => {
	let testClass;
	let testClassInst;
	step("Extends from Exporter", () => {
		testClass = class Test extends Exporter {
			exports = {
				a: 1,
				b: () => 2
			}
		};
	});
	it("Create instance of extended test class", () => {
		testClassInst = new testClass();
	});
	it("Export in global scope", () => {
		global.a = 3;
		global.b = 4;
		testClassInst.emit("export");
		chai.expect(global).to.include.property("a", 1);
		chai.expect(global).to.include.property("b");
		chai.expect(global.b()).to.be.equal(2);
	});
	it("Teardown exported globals", () => {
		testClassInst.emit('teardown');
		chai.expect(global).to.include.property("a", 3);
		chai.expect(global).to.include.property("b", 4);
	});
	describe('Group export', () => {
		let ex;
		before(() => {
			ex = new testClass();
			ex.exports = {
				a: {
					a: 1,
					b: 2,
				},
				b: {
					c: 3,
					d: 4
				}
			};
		})
		it("Export all", () => {
			global.a = global.b = global.c = global.d = "foo";
			ex.emit('export');
			chai.expect(global).to.include.property("a", 1);
			chai.expect(global).to.include.property("b", 2);
			chai.expect(global).to.include.property("c", 3);
			chai.expect(global).to.include.property("d", 4);
		});
		it("Teardown all exports", () => {
			ex.emit('teardown');
			chai.expect(global).to.include.property("a", 'foo');
			chai.expect(global).to.include.property("b", 'foo');
			chai.expect(global).to.include.property("c", 'foo');
			chai.expect(global).to.include.property("d", 'foo');
		});
		it("Export group a", () => {
			ex.emit('export', 'a');
			chai.expect(global).to.include.property("a", 1);
			chai.expect(global).to.include.property("b", 2);
			chai.expect(global).to.include.property("c", 'foo');
			chai.expect(global).to.include.property("d", 'foo');
		});
		it("Teardown group a", () => {
			ex.emit('teardown', 'a');
			chai.expect(global).to.include.property("a", 'foo');
			chai.expect(global).to.include.property("b", 'foo');
			chai.expect(global).to.include.property("c", 'foo');
			chai.expect(global).to.include.property("d", 'foo');
		});
		it('Export both groups it two events', () => {
			ex.emit('export', 'a');
			ex.emit('export', 'b');
			chai.expect(global).to.include.property("a", 1);
			chai.expect(global).to.include.property("b", 2);
			chai.expect(global).to.include.property("c", 3);
			chai.expect(global).to.include.property("d", 4);
		});
		it('Teardown both groups in two events', () => {
			ex.emit('teardown', 'a');
			chai.expect(global).to.include.property("a", 'foo');
			chai.expect(global).to.include.property("b", 'foo');
			ex.emit('teardown', 'b');
			chai.expect(global).to.include.property("c", 'foo');
			chai.expect(global).to.include.property("d", 'foo');
		})
	})
});