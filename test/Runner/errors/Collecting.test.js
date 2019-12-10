const Runner = require('../../../lib/classes/Runner');

describe('Runner collecting on errors', () => {
	describe('Runner', () => {
		describe("Runtime", () => {
			it('Emerge inner sync error do not appear in runtime', async () => {
				const runner = new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Emerge.runtime.js"}});
				await chai.expect(runner.run()).to.not.be.rejected
				const collect = runner.result;
				chai.expect(collect).to.include.nested.property('errors[0]').and.include({name: "Error"})
				runner.unloadTestFiles();
			});
			it('Emerge inner async error do not appear in runtime', async () => {
				const runner = new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Emerge2.runtime.js"}});
				await chai.expect(runner.run()).to.not.be.rejected
				const collect = runner.result;
				chai.expect(collect).to.include.nested.property('errors[0]').and.include({name: "Error"})
				runner.unloadTestFiles();
			});
			describe("Seed", () => {
				it("Seed throws in sync", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "Seeding1.runtime.js"}});
					await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
					const collect = runner.result;
					chai.expect(collect).to.include.nested.property('errors[0]').and.include({name: "Error"})
					chai.expect(collect).to.include.property('error').and.include({name: "MI_SEEDING_FAILED"})
					chai.expect(collect).to.include({fatal: true})
					runner.unloadTestFiles();
				});
				it("Seed throws in async", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "Seeding2.runtime.js"}});
					await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
					const collect = runner.result;
					chai.expect(collect).to.include.nested.property('errors[0]').and.include({name: "Error"})
					chai.expect(collect).to.include.property('error').and.include({name: "MI_SEEDING_FAILED"})
					chai.expect(collect).to.include({fatal: true})
					runner.unloadTestFiles();
				})
			});
			describe("Hook", () => {
				it("Hook function throws sync error", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook.runtime.js"}});
					await chai.expect(runner.run()).to.not.be.rejected
					const collect = runner.result;
					chai.expect(collect).to.include.nested.property('errors[0]').and.include({name: "Error"})
					runner.unloadTestFiles();
				});
				it("Hook function throws async error", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook2.runtime.js"}});
					await chai.expect(runner.run()).to.not.be.rejected
					const collect = runner.result;
					chai.expect(collect).to.include.nested.property('errors[0]').and.include({name: "Error"})
					runner.unloadTestFiles();
				})
			});
			describe("MI", () => {
				describe("Seed", () => {
					it("Seed throws in sync (with INTERRUPT_RUN)", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Seed", pattern: "Seeding1.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.nested.property('suites[0].errors[0]').and.include({name: "Error"})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_SEEDING_FAILED"})
						runner.unloadTestFiles();
					});
					it("Seed throws in async (with INTERRUPT RUN)", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Seed", pattern: "Seeding2.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.nested.property('suites[0].errors[0]').and.include({name: "Error"})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_SEEDING_FAILED"})
						runner.unloadTestFiles();
					})
				});
				describe("Hook", () => {
					it("Hook function throws sync error", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook.runtime.js"}});
						await chai.expect(runner.run()).to.not.be.rejected
						const collect = runner.result;
						chai.expect(collect).to.include.nested.property('suites[0].errors[0]').and.include({name: "Error"})
						runner.unloadTestFiles();
					});
					it("Hook function throws async error", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook2.runtime.js"}});
						await chai.expect(runner.run()).to.not.be.rejected
						const collect = runner.result;
						chai.expect(collect).to.include.nested.property('suites[0].errors[0]').and.include({name: "Error"})
						runner.unloadTestFiles();
					})
				});
				describe("Test", () => {
					it("Test without fn", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Test.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					});
					it("Test config isn\'t an object", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Test3.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					});
					it("Test timeout isn\'t a number", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Test4.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					})
				});
				describe("TestSuite", () => {
					it("TestSuite without args", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					});
					it("TestSuite timeout isn't a number", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare2.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					});
					it("TestSuite config isn't an object", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare3.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					});
					it("TestSuite function throws error", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare4.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						const collect = runner.result;
						chai.expect(collect).to.include({fatal: true})
						chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
						runner.unloadTestFiles();
					});
					describe('Test', () => {
						it("Test without fn", async () => {
							const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite/Test", pattern: "Test.runtime.js"}});
							await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
							const collect = runner.result;
							chai.expect(collect).to.include({fatal: true})
							chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
							runner.unloadTestFiles();
						});
						it("Test config isn\'t an object", async () => {
							const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite/Test", pattern: "Test3.runtime.js"}});
							await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
							const collect = runner.result;
							chai.expect(collect).to.include({fatal: true})
							chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
							runner.unloadTestFiles();
						});
						it("Test timeout isn\'t a number", async () => {
							const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite/Test", pattern: "Test4.runtime.js"}});
							await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
							const collect = runner.result;
							chai.expect(collect).to.include({fatal: true})
							chai.expect(collect).to.include.property('error').and.include({name: "MI_RUNNER_FATAL"})
							runner.unloadTestFiles();
						})
					})
				});
			})
		})
	})
});
