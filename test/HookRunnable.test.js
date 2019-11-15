const HookRunnable = require('../lib/classes/abstract/HookedRunnable');
const Hook = require('../lib/classes/abstract/Hook');


describe("HookRunnable class", () => {
	let testClass;
	it("Extends from HookRunnable", () => {
		testClass = class Test extends HookRunnable {};
		testClass.hooks = { HOOK: 'hook' };
	});
	it("Create class instance", () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		chai.expect(runnable.hooks).to.include.property('hook')
			.and.to.have.keys(['export', 'hook'])
	});
	it("Run instance", async () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		chai.expect(runnable.run()).to.not.be.rejected;
	});
	it("Add hook and run", () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		runnable.registerHook("hook",() => {});
		chai.expect(runnable.run()).to.not.be.rejected;
	});
	it("Run runnable hook", async () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		runnable.registerHook('hook', () => {});
		await chai.expect(runnable.runHook('hook')).to.not.be.rejected;
	});
	it("Hook triggers event", async () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		runnable.registerHook('hook', timeout_f(100, true, 1));
		const event = new Promise((resolve, reject) => {
			const timer = setTimeout(reject, 100);
			runnable.on('hook', resolve);
		});
		await chai.expect(runnable.runHook('hook')).to.not.be.rejected;
		await chai.expect(event).to.not.be.rejected;
	});
	it("Only Hook instances", () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		runnable.hooks['foo'] = () => {};
		chai.expect(runnable.runHook('foo')).to.be.rejectedWith(TypeError)
	});
	it("Run undefined hook", () => {
		const runnable = new testClass({fn: () => {}, name: "", context: {}});
		chai.expect(runnable.runHook('foo')).to.be.rejectedWith(errors.MIHookNotFound)
	});
	describe("Context", () => {
		it("Hook changes runnable context in sync", async () => {
			const runnable = new testClass({fn: () => {}, name: "", context: {}});
			runnable.registerHook('hook', (context) => { context.a = 1 });
			await chai.expect(runnable.runHook('hook')).to.not.be.rejected;
			chai.expect(runnable.context).to.include.property('a', 1);
		});
		it("Hook changes runnable context in async", async () => {
			const runnable = new testClass({fn: () => {}, name: "", context: {}});
			runnable.registerHook('hook', async (context) => { context.a = 1 });
			await chai.expect(runnable.runHook('hook')).to.not.be.rejected;
			chai.expect(runnable.context).to.include.property('a', 1);
		});
		it("Runnable main function has access to context", async () => {
			const runnable = new testClass({fn: (context) => { context.d = context.a.b + context.a.c }, name: "", context: {}});
			runnable.registerHook('hook', async (context) => { context.a = {b: 1, c: 2} });
			await chai.expect(runnable.runHook('hook')).to.not.be.rejected;
			await chai.expect(runnable.run()).to.not.be.rejected;
			chai.expect(runnable.context).to.include.property('d', 3)
		})
	})
});
