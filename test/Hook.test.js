const Hook = require('../lib/classes/abstract/Hook');

describe('Hook class', () => {
	it("Create hook instance", () => {
		const hook = new Hook({ fn: () => {}, name: "hook", context: {}})
	});
	it("Run hook", async () => {
		const hook = new Hook({ fn: () => {}, name: "hook", context: {}});
		await chai.expect(hook.run()).to.not.be.rejected;
	});
	describe("Main function throws err", () => {
		it("Throws in async", async () => {
			const hook = new Hook({ fn: timeout_f(100, false, 0), name: "hook", context: {}});
			await chai.expect(hook.run()).to.be.rejected;
			chai.expect(hook.error).to.be.equal(0)
		});
		it("Throws in sync", async () => {
			const hook = new Hook({ fn: () => { throw new Error() }, name: "hook", context: {}});
			await chai.expect(hook.run()).to.be.rejected;
			chai.expect(hook.error).to.be.instanceof(Error)
		})
	})
})