const Runnable = require('../lib/classes/abstract/Runnable');
const errors = require('../lib/errors');
const chai = require('chai');

describe("Runnable abstract class", () => {
	let testClass;
	let testClassInstance;
	step("Extends from Runnable", () => {
		testClass = class Test extends Runnable {};
		testClass.consistenceProperty = "test";
		testClass.consistenceKey = "test";
	});
	it("Create instance of extended test class", () => {
		testClassInstance = new testClass();
	});
	describe('Without nesting', () => {
		it("Begin runnable with nesting forbidden", () => {
			testClassInstance.emit(Runnable.events.EVENT_RUNNABLE_BEGIN);
			chai.expect(global).to.include.property(testClass.consistenceProperty)
				.and.to.include.property(testClass.consistenceKey)
				.and.to.be.true;
		});
		it("Begin another runnable while other isn't finished", () => {
			const begin = () => {
				const t = new testClass();
				t.emit(testClass.events.EVENT_RUNNABLE_BEGIN);
			};
			chai.expect(begin).to.throw(errors.MIConsistenceError);
		});
		it("Finish first runnable", () => {
			testClassInstance.emit(testClass.events.EVENT_RUNNABLE_END);
			chai.expect(global).to.include.property(testClass.consistenceProperty)
				.and.to.include.property(testClass.consistenceKey)
				.and.to.be.false;
		});
		it("Begin another runnable", () => {
			const testClassInst2 = new testClass();
			testClassInst2.emit(testClass.events.EVENT_RUNNABLE_BEGIN);
			testClassInst2.emit(testClass.events.EVENT_RUNNABLE_END);
		})
	});
	describe("With nesting", () => {
		it("Run nested runnable", () => {
			testClass.nested = true;
			testClassInstance.emit(testClass.events.EVENT_RUNNABLE_BEGIN);
			const inst = new testClass();
			inst.emit(testClass.events.EVENT_RUNNABLE_BEGIN);
			testClassInstance.emit(testClass.events.EVENT_RUNNABLE_END);
			inst.emit(testClass.events.EVENT_RUNNABLE_END);
		})
	})
});
