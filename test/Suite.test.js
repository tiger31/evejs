const Suite = require('../lib/classes/Suite');

describe('Suite class', () => {
	let inst;
	it("Create class instance", () => {
		inst = new Suite({ fn: () => {}, name: "Root", runner: ""});
	});
	it("Suite initialization", () => {
		const suite = new Suite({ name: "Full 1", runner: "", fn: () => {
				seed("Seed 1", () => {});
				seed("Seed 2", () => {});
				emerge(() => {});
				main(() => {});
			}
		});
		chai.expect(suite.seeds).to.have.lengthOf(2);
		chai.expect(suite.seeds.map(seed => seed.name)).to.include.all.members(['Seed 1', 'Seed 2']);
		chai.expect(suite.emergeBlocks).to.have.lengthOf(1);
		chai.expect(suite.test).to.be.instanceOf(Function);
	});
	it('Emerge block error does not crash suite', async () => {
		const suite = new Suite({ fn: () => { emerge(() => { throw new Error()})}, name: "Emerge 1", runner: ""});
		await chai.expect(suite.runEmerges()).to.not.be.rejected;
	});
	describe("Suite hooks", () => {
		describe("In common", () => {
			it("All hooks pre defined", () => {
				chai.expect(inst).to.include.property('hooks')
					.and.include.all.keys(Object.values(Suite.hooks))
			});
			it("Export controls", () => {
				inst.emit('export', 'controls');
				chai.expect(global).to.include.keys(Object.keys(inst.exports.controls));
			});
			describe('Controls', () => {
				it('seed function', () => {
					global['seed']('Seed 1', () => {});
					chai.expect(inst.seeds).to.have.lengthOf(1)
						.and.include.property('0')
						.and.include.property('name', 'Seed 1')
				});
				it('main function', () => {
					const foo = () => {};
					global['main'](foo);
					chai.expect(inst.test).to.be.equal(foo);
				});
				it('emerge function', () => {
					const foos = [() => {}, () => {}];
					global['emerge'](foos[0]);
					chai.expect(inst.emergeBlocks).to.have.lengthOf(1)
						.and.include.property('0', foos[0])
					global['emerge'](foos[1]);
					chai.expect(inst.emergeBlocks).to.have.lengthOf(2)
						.and.include.property('1', foos[1])
				})
			});
			it("Export hooks", () => {
				inst.emit('export', 'hooks');
				chai.expect(global).to.include.keys(Object.values(Suite.hooks));
			});
			for (let hook of Object.values(Suite.hooks)) {
				describe(`Hook ${hook}`, () => {
					it('Set hook function', () => {
						global[hook]((context) => context.name = hook)
					});
					it('Run hook', async () => {
						await inst.runHook(hook);
						chai.expect(inst.context).to.include.property('name', hook);
					})
				})
			}
		});
		after(() => {
			inst.emit('teardown');
		})
	});
	describe('Run seeds', () => {
		it('Suite with single sync seed', async () => {
			const suite = new Suite({ fn: () => {}, name: "Suite 1", runner: "" });
			suite.seed('seed', (context) => { context.a = 1 });
			await chai.expect(suite.runSeeds()).to.not.be.rejected;
			chai.expect(suite.context).to.include.property('a', 1);
		});
		it('Suite with single async seed', async () => {
			const suite = new Suite({ fn: () => {}, name: "Suite 1", runner: "" });
			suite.seed('seed', delayed((context) => { context.a = 1 }, 500));
			await chai.expect(suite.runSeeds()).to.not.be.rejected;
			chai.expect(suite.context).to.include.property('a', 1);
		});
		it('Suite with two sync seeds', async () => {
			const suite = new Suite({ fn: () => {}, name: "Suite 2", runner: "" });
			suite.seed('seed', (context) => { context.a = 1 });
			suite.seed('seed2', (context) => { context.b = 1 });
			chai.expect(suite.seed).to.have.lengthOf(2);
			await chai.expect(suite.runSeeds()).to.not.be.rejected;
			chai.expect(suite.context).to.include({a: 1})
				.and.own.include({b: 1});
		});
		it('Suite with two async seeds', async () => {
			const suite = new Suite({ fn: () => {}, name: "Suite 3", runner: "" });
			suite.seed('seed', delayed((context) => { context.a = 1 }, 500));
			suite.seed('seed2', delayed((context) => { context.b = 1 }, 500));
			chai.expect(suite.seed).to.have.lengthOf(2);
			await chai.expect(suite.runSeeds()).to.not.be.rejected;
			chai.expect(suite.context).to.include({a: 1})
				.and.own.include({b: 1});
		});
		it("Suite with seed that throws error in sync", async () => {
			const suite = new Suite({ fn: () => {}, name: "Suite 4", runner: "" });
			suite.seed('seed', (context) => { throw new TypeError() });
			await chai.expect(suite.runSeeds()).to.not.be.rejected;
			chai.expect(suite.errors).to.have.lengthOf(1)
				.and.own.include.property('0')
				.and.to.be.instanceOf(TypeError);
		});
		it("Suite with seed that throws error in async", async () => {
			const suite = new Suite({ fn: () => {}, name: "Suite 4", runner: "" });
			suite.seed('seed', timeout_f(500, false, new ReferenceError()));
			await chai.expect(suite.runSeeds()).to.not.be.rejected;
			chai.expect(suite.errors).to.have.lengthOf(1)
				.and.own.include.property('0')
				.and.to.be.instanceOf(ReferenceError);
		});
		describe("Seeding modes", () => {
			it('ALLOW_TO_FAIL', () => {

			})
		});
		describe("Seeding behaviour", () => {
			it('CONTINUE', async () => {
				const suite = new Suite({ fn: () => {}, name: "Suite 4", runner: "" }, { behavior: Suite.behaviour.CONTINUE });
				suite.seed('seed', timeout_f(500, false, new ReferenceError()));
				suite.seed('seed', delayed((context) => { context.a = 1 }, 500));
				await chai.expect(suite.runSeeds()).to.not.be.rejected;
				chai.expect(suite.errors).to.have.lengthOf(1)
					.and.own.include.property('0')
					.and.to.be.instanceOf(ReferenceError);
				chai.expect(suite.context).to.include({a: 1});
			});
			it('INTERRUPT', async () => {
				const suite = new Suite({ fn: () => {}, name: "Suite 5", runner: "" }, { behavior: Suite.behaviour.INTERRUPT });
				suite.seed('seed', timeout_f(500, false, new Error()));
				suite.seed('seed', delayed((context) => { context.a = 1 }, 500));
				await chai.expect(suite.runSeeds()).to.not.be.rejected;
				chai.expect(suite.errors).to.have.lengthOf(1)
					.and.own.include.property('0')
					.and.to.be.instanceOf(Error);
				chai.expect(suite.context).to.not.include({a: 1});
			})
		})
	});
	describe('Suite main function', () => {
		it('Main function does not throw', async () => {
			const suite = new Suite({ fn: () => {}, name: "Main 1", runner: ""});
			suite.main((context) => { context.a = 1 }, {});
			await chai.expect(suite.runTests()).to.not.be.rejected;
			chai.expect(suite.context).to.include({a: 1});
		});
		it('Main function throws err', async () => {
			const suite = new Suite({ fn: () => {}, name: "Main 1", runner: ""});
			suite.main((context) => { throw new Error() }, {});
			await chai.expect(suite.runTests()).to.be.rejectedWith(errors.MIFrameworkError);
			chai.expect(suite.errors).to.have.lengthOf(1)
				.and.include.property('0')
				.and.to.be.instanceOf(Error);
		})
	});
});