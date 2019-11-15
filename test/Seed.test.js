const Seed = require('../lib/classes/Seed');
const errors = require('../lib/errors');
const chai = require('chai');
chai.use(require('chai-as-promised'));

const timeout_f = (timeout, resolve, value) => () => new Promise((rs, rj) => {
	setTimeout(() => {
		(resolve) ? rs(value) : rj(value);
	}, timeout)
});

describe("Seed class", () => {
	let inst;
	it("Create class instance", () => {
		inst = new Seed({
			fn: timeout_f(700, true, 1),
			context: {},
			name: "test"
		}, { timeout: 1500 })
		chai.expect(inst.status).to.be.equal(Seed.status.NOT_STARTED);
	});
	it("Run common seed", async () => {
		await inst.run();
	});
	it("Run seed twice as there were two of them", async () => {
		await inst.run();
		await inst.run();
	});
	describe("Seed rejection", () => {
		it ("Main function throws err (async)", async () => {
			const seed = new Seed({ fn: timeout_f(500, false, 0), context: {}, name: "" });
			await chai.expect(seed.run()).to.be.rejected;
			chai.expect(seed.status).to.be.equal(Seed.status.FAILED);
		});
		it ("Main function throws err (sync)", async () => {
			const seed = new Seed({ fn: () => { throw new Error() }, context: {}, name: "" });
			await chai.expect(seed.run()).to.be.rejectedWith(Error);
			chai.expect(seed.status).to.be.equal(Seed.status.FAILED);
		});
		it ("Main function timeout", async () => {
			const seed = new Seed({ fn: timeout_f(500, false, 0), context: {}, name: "" }, {timeout: 100});
			await chai.expect(seed.run()).to.be.rejectedWith(errors.MITimeoutError);
			chai.expect(seed.status).to.be.equal(Seed.status.FAILED);
		});
		it ("Main function throws UnhandledPromiseRejectionWarning", async () => {
			const seed = new Seed({ fn: () => Promise.reject(), context: {}, name: "" }, {timeout: 100});
			await chai.expect(seed.run()).to.be.rejected;
			chai.expect(seed.status).to.be.equal(Seed.status.FAILED);
		});
	});
	describe("Seed resolves", () => {
		it("Main function async", async () => {
			const seed = new Seed({ fn: timeout_f(100, true, 1), context: {}, name: "" }, {timeout: 200});
			await chai.expect(seed.run()).to.not.be.rejected;
			chai.expect(seed.status).to.be.equal(Seed.status.SUCCEEDED);
		});
		it("Main function sync", async () => {
			const seed = new Seed({ fn: () => 1, context: {}, name: "" }, {timeout: 200});
			await chai.expect(seed.run()).to.not.be.rejected;
			chai.expect(seed.status).to.be.equal(Seed.status.SUCCEEDED);
		})
	});
	describe("Seed nesting", () => {
		it("Run two seeds at the same time (not nested)", async () => {
			const seeds = [
				new Seed({ fn: () => 1, context: {}, name: "" }, {timeout: 200}),
				new Seed({ fn: () => 1, context: {}, name: "" }, {timeout: 200})
			];
			await chai.expect(Promise.all(seeds)).to.not.be.rejected
		});
		it("Created nested seed", async () => {
			const seed = new Seed({ fn: () => new Seed({ fn: () => {}, context: {}, name: "" }), context: {}, name: "" }, {timeout: 200});
			await chai.expect(seed.run()).to.be.rejectedWith(errors.MIConsistenceError);
		})
	})
});
