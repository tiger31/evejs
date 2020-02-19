const Hook = require('../lib/classes/abstract/Hook');

describe('Hook class', () => {
	it("Create hook instance", () => {
		const hook = new Hook({ fn: () => {}, title: "hook", context: {}})
	});
	it("Run hook", async () => {
		let a = 0;
		const hook = new Hook({ fn: () => {}, title: "hook", context: {}});
		hook.on(Hook.events.HOOK_SUCCEEDED, () => a = 2);
		await expect(hook.run()).to.not.be.rejected;
		expect(a).to.be.equal(2);
	});
	describe("Main function throws err", () => {
		it("Throws in async", async () => {
			let a = 0;
			const hook = new Hook({ fn: timeout_f(100, false, 0), title: "hook", context: {}});
			hook.on(Hook.events.HOOK_FAILED, () => a = 1);
			await expect(hook.run()).to.not.be.rejected;
			expect(a).to.be.equal(1);
		});
		it("Throws in sync", async () => {
			let a = 0;
			const hook = new Hook({ fn: () => { throw new Error() }, title: "hook", context: {}});
			hook.on(Hook.events.HOOK_FAILED, () => a = 1);
			await expect(hook.run()).to.not.be.rejected;
			expect(a).to.be.equal(1);
		})
	})
})