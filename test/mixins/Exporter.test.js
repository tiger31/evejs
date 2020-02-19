const Exporter = require('../../lib/classes/mixins/Exporter');

describe("Exporter mixin", () => {
	let testClass;
	let testClassInst;
	step("Implementation", () => {
		testClass = Exporter(class Test {});
	});
	it("Create instance of extended test class", () => {
		testClassInst = new testClass();
		testClassInst.exports = {
			a: 1,
			b: () => 2
		};
	});
	it("Export in global scope", () => {
		global.a = 3;
		global.b = 4;
		testClassInst.export();
		expect(global).to.include.property("a", 1);
		expect(global).to.include.property("b");
		expect(global.b()).to.be.equal(2);
	});
	it("Retain exported globals", () => {
		testClassInst.retain();
		expect(global).to.include.property("a", 3);
		expect(global).to.include.property("b", 4);
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
		});
		it("Export all", () => {
			global.a = global.b = global.c = global.d = "foo";
			ex.export();
			expect(global).to.include.property("a", 1);
			expect(global).to.include.property("b", 2);
			expect(global).to.include.property("c", 3);
			expect(global).to.include.property("d", 4);
		});
		it("Retain all exports", () => {
			ex.retain();
			expect(global).to.include.property("a", 'foo');
			expect(global).to.include.property("b", 'foo');
			expect(global).to.include.property("c", 'foo');
			expect(global).to.include.property("d", 'foo');
		});
		it("Export group a", () => {
			ex.export('a');
			expect(global).to.include.property("a", 1);
			expect(global).to.include.property("b", 2);
			expect(global).to.include.property("c", 'foo');
			expect(global).to.include.property("d", 'foo');
		});
		it("Retain group a", () => {
			ex.retain('a');
			expect(global).to.include.property("a", 'foo');
			expect(global).to.include.property("b", 'foo');
			expect(global).to.include.property("c", 'foo');
			expect(global).to.include.property("d", 'foo');
		});
		it('Export both groups it two calls', () => {
			ex.export('a');
			ex.export('b');
			expect(global).to.include.property("a", 1);
			expect(global).to.include.property("b", 2);
			expect(global).to.include.property("c", 3);
			expect(global).to.include.property("d", 4);
		});
		it('Retain both groups in two calls', () => {
			ex.retain('a');
			expect(global).to.include.property("a", 'foo');
			expect(global).to.include.property("b", 'foo');
			ex.retain('b');
			expect(global).to.include.property("c", 'foo');
			expect(global).to.include.property("d", 'foo');
		})
	})
});