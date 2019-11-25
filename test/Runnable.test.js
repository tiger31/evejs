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
	});
	describe('Proxy events', () => {
		describe('_proxyEvent method', () => {
			it('Proxy from event to event2', async () => {
				const t1 = new testClass();
				const t2 = new testClass();
				t2._proxyEvent('event', 'event2', t1);
				let resolver = {};
				let promise = new Promise((resolve, reject) => {
					resolver = {resolve, reject};
				});
				t2.on('event2', () => {
					resolver.resolve();
				});
				t1.emit('event');
				await chai.expect(promise).to.be.fulfilled;
			});
			it('Proxy event with 3 args', async () => {
				const t1 = new testClass();
				const t2 = new testClass();
				t2._proxyEvent('event', 'event2', t1);
				let resolver = {};
				let promise = new Promise((resolve, reject) => {
					resolver = {resolve, reject};
				});
				t2.on('event2', (one, two, three) => {
					resolver.resolve({one, two, three});
				});
				t1.emit('event', 'a', 'b', 'c');
				await chai.expect(promise).to.eventually.include({one: 'a', two: 'b', three: 'c'});
			});
			it('Proxy on non emitter', async () => {
				const t1 = {};
				const t2 = new testClass();
				chai.expect(() => {
					t2._proxyEvent('event', 'event2', t1);
				}).to.throw(errors.MINotEmitter);
			});
			it('Proxy on itself', async () => {
				const t2 = new testClass();
				chai.expect(() => {
					t2._proxyEvent('event', 'event2', t2);
				}).to.throw(ReferenceError);
			});
		});
		describe('proxy method', () => {
			it('event as a string', async () => {
				const t1 = new testClass();
				const t2 = new testClass();
				t2.proxy('event', t1);
				let resolver = {};
				let promise = new Promise((resolve, reject) => {
					resolver = {resolve, reject};
				});
				t2.on('event', () => {
					resolver.resolve();
				});
				chai.expect(promise).to.be.fulfilled;
			});
			it('event as an array of events', async () => {
				const t1 = new testClass();
				const t2 = new testClass();
				t2.proxy(['event', 'event2'], t1);
				let resolver = {};
				let promise = new Promise((resolve, reject) => {
					resolver = {resolve, reject};
				});
				const f = () => { resolver.resolve(); };
				t2.on('event', f);
				t2.on('event2', f);
				t1.emit('event');
				await chai.expect(promise).to.be.fulfilled;
				promise = new Promise((resolve, reject) => {
					resolver = {resolve, reject};
				});
				t2.emit('event2');
				chai.expect(promise).to.be.fulfilled;
			});
			it('Event as object', async () => {
				const t1 = new testClass();
				const t2 = new testClass();
				t2.proxy({from: 'event', to: 'event2'}, t1);
				let resolver = {};
				let promise = new Promise((resolve, reject) => {
					resolver = {resolve, reject};
				});
				const f = () => { resolver.resolve(); };
				t2.on('event2', f);
				t1.emit('event');
				await chai.expect(promise).to.be.fulfilled;
			})
		})
	})
});
