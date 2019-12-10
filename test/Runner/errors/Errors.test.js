const Runner = require('../../../lib/classes/Runner');

describe('Runner error handling', () => {

	describe('Runner', () => {
		describe('Initialization', () => {
			/*
				Runner thrown error
				- Tests directory not found
				- Exception on file require
				- Bad driver
				- Bad reporter
				- Emerge not a function
				- Scope bad scope
				- Scope function not a function
				- Scope fn throws error
			 */
			it('Tests directory does not exists', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/folder"}});
				chai.expect(runner).to.throw(ReferenceError, 'Tests');
			});
			it('Exception on file require', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Bad.runner.js"}});
				chai.expect(runner).to.throw(ReferenceError, 'defined');
			});
			it('Driver not a instance of Driver', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/"}, driver: {}});
				chai.expect(runner).to.throw(TypeError);
			});
			it('Reporter not a instance of Reporter', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/"}, reporter: {}});
				chai.expect(runner).to.throw(TypeError);
			});
			it('Emerge function not a function', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Emerge.runner.js"}});
				chai.expect(runner).to.throw(TypeError, 'function');
			});
			it('Scope not a string or array of strings', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Scope.runner.js"}});
				chai.expect(runner).to.throw(TypeError, 'string');
			});
			it('Scope function isn\'t a function', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Scope2.runner.js"}});
				chai.expect(runner).to.throw(TypeError, 'function');
			});
			it('Error thrown in scope', () => {
				const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Scope2.runner.js"}});
				chai.expect(runner).to.throw(Error);
			});
			/*
				 Errors thrown by seed initiation in runner
				 - Unresolved var
				 - Seed config not an object
				 - Seed timeout not a number
				 - Seed function not a function
			 */
			describe('Seeds', () => {
				it('Seed config undefiled variable', () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf1.js"}});
					chai.expect(runner).to.throw(ReferenceError, 'defined');
				});
				it('Seed config not an object', () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf2.js"}});
					chai.expect(runner).to.throw(TypeError, 'Seed');
				});
				it('Seed config timeout isn\' a number', () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf3.js"}});
					chai.expect(runner).to.throw(TypeError, 'Timeout');
				});
				it('Seed function isn\' a function', () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf4.js"}});
					chai.expect(runner).to.throw(TypeError, 'Seed');
				});
			});
			describe("Hook", () => {
				it("Hook without args", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook.init.js"}});
					chai.expect(runner).to.throw(TypeError, 'Hook');
				});
				it("Hook timeout isn't a number", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook2.init.js"}});
					chai.expect(runner).to.throw(TypeError, 'Timeout');
				});
				it("Hook config isn't a object", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook3.init.js"}});
					chai.expect(runner).to.throw(TypeError, 'Hook');
				})
			});
			describe('MI', () => {
				/*
					Errors thrown by mi function on initialization
					- Unresolved config
					- Config not an object
					- Function not a function
					- Function throws err on execution
					- Nested mi
					- Emerge function not a function
				 */
				it("Suite config unresolved", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI", pattern: "Test.mi.js"}});
					chai.expect(runner).to.throw(ReferenceError, 'defined');
				});
				it("Suite config isn\'t an object", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI", pattern: "Test2.mi.js"}});
					chai.expect(runner).to.throw(TypeError, 'Suite');
				});
				it("Suite function isn\'t a function", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI", pattern: "Test3.mi.js"}});
					chai.expect(runner).to.throw(TypeError, 'Suite');
				});
				it("Suite's function throws error on execution", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI", pattern: "Test4.mi.js"}});
					chai.expect(runner).to.throw(Error);
				});
				it("Suite nesting found", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI", pattern: "Test5.mi.js"}});
					chai.expect(runner).to.throw(errors.MIConsistenceError, 'Suite');
				});
				it("Emerge function isn\'t a function", () => {
					const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI", pattern: "Test6.mi.js"}});
					chai.expect(runner).to.throw(TypeError, 'function');
				});
				/*
					Exceptions in TestSuite/Test
					- Inner test suite exception
					- Inner test exception
				 */
				describe('Drivens', () => {
					it("Inner TestSuite exception does not appear in initializing state", () => {
						const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Init.ts.js"}});
						chai.expect(runner).to.not.throw();
					});
					it("Inner Test exception does not appear in initializing state", () => {
						const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Init.t.js"}});
						chai.expect(runner).to.not.throw();
					});
				});
				/*
					 Errors thrown by seed initiation in runner
					 - Unresolved var
					 - Seed config not an object
					 - Seed timeout not a number
					 - Seed function not a function
				 */
				describe('Seeds', () => {
					it('Seed config undefiled variable', () => {
						const runner = () => new Runner({
							test: {
								dir: "test/Runner/errors/tests/MI/Seed",
								pattern: "*.seedconf1.js"
							}
						});
						chai.expect(runner).to.throw(ReferenceError, 'defined');
					});
					it('Seed config not an object', () => {
						const runner = () => new Runner({
							test: {
								dir: "test/Runner/errors/tests/MI/Seed",
								pattern: "*.seedconf2.js"
							}
						});
						chai.expect(runner).to.throw(TypeError, 'Seed');
					});
					it('Seed config timeout isn\' a number', () => {
						const runner = () => new Runner({
							test: {
								dir: "test/Runner/errors/tests/MI/Seed",
								pattern: "*.seedconf3.js"
							}
						});
						chai.expect(runner).to.throw(TypeError, 'Timeout');
					});
					it('Seed function isn\' a function', () => {
						const runner = () => new Runner({
							test: {
								dir: "test/Runner/errors/tests/MI/Seed",
								pattern: "*.seedconf4.js"
							}
						});
						chai.expect(runner).to.throw(TypeError, 'Seed');
					});
				});
				describe("Hook", () => {
					it("Hook without args", () => {
						const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook.init.js"}});
						chai.expect(runner).to.throw(TypeError, 'Hook');
					});
					it("Hook timeout isn't a number", () => {
						const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook2.init.js"}});
						chai.expect(runner).to.throw(TypeError, 'Timeout');
					});
					it("Hook config isn't a object", () => {
						const runner = () => new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook3.init.js"}});
						chai.expect(runner).to.throw(TypeError, 'Hook');
					})
				});
			})
		});
		describe("Runtime", () => {
			it('Emerge inner sync error do not appear in runtime', async () => {
				const runner = new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Emerge.runtime.js"}});
				await chai.expect(runner.run()).to.not.be.rejected
				runner.unloadTestFiles();
			});
			it('Emerge inner async error do not appear in runtime', async () => {
				const runner = new Runner({test: {dir: "test/Runner/errors/tests/", pattern: "Emerge2.runtime.js"}});
				await chai.expect(runner.run()).to.not.be.rejected
				runner.unloadTestFiles();
			});
			describe("Seed", () => {
				it("Seed throws in sync", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "Seeding1.runtime.js"}});
					await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
					runner.unloadTestFiles();
				});
				it("Seed throws in async", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Seed", pattern: "Seeding2.runtime.js"}});
					await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
					runner.unloadTestFiles();
				})
			});
			describe("Hook", () => {
				it("Hook function throws sync error", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook.runtime.js"}});
					await chai.expect(runner.run()).to.not.be.rejected
					runner.unloadTestFiles();
				});
				it("Hook function throws sync error", async () => {
					const runner = new Runner({test: {dir: "test/Runner/errors/tests/Hook", pattern: "Hook2.runtime.js"}});
					await chai.expect(runner.run()).to.not.be.rejected
					runner.unloadTestFiles();
				})
			});
			describe("MI", () => {
				describe("Seed", () => {
					it("Seed throws in sync (with INTERRUPT_RUN)", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Seed", pattern: "Seeding1.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
						runner.unloadTestFiles();
					});
					it("Seed throws in async (with INTERRUPT RUN)", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Seed", pattern: "Seeding2.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MISeedingFailed)
						runner.unloadTestFiles();
					})
				});
				describe("Hook", () => {
					it("Hook function throws sync error", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook.runtime.js"}});
						await chai.expect(runner.run()).to.not.be.rejected
						runner.unloadTestFiles();
					});
					it("Hook function throws sync error", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Hook", pattern: "Hook2.runtime.js"}});
						await chai.expect(runner.run()).to.not.be.rejected
						runner.unloadTestFiles();
					})
				});
				describe("Test", () => {
					it("Test without fn", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Test.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					});
					it("Test config isn\'t an object", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Test3.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					});
					it("Test timeout isn\'t a number", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/Test", pattern: "Test4.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					})
				});
				describe("TestSuite", () => {
					it("TestSuite without args", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					});
					it("TestSuite timeout isn't a number", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare2.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					});
					it("TestSuite config isn't an object", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare3.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					});
					it("TestSuite function throws error", async () => {
						const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite", pattern: "Prepare4.runtime.js"}});
						await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
						runner.unloadTestFiles();
					});
					describe('Test', () => {
						it("Test without fn", async () => {
							const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite/Test", pattern: "Test.runtime.js"}});
							await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
							runner.unloadTestFiles();
						});
						it("Test config isn\'t an object", async () => {
							const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite/Test", pattern: "Test3.runtime.js"}});
							await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
							runner.unloadTestFiles();
						});
						it("Test timeout isn\'t a number", async () => {
							const runner = new Runner({test: {dir: "test/Runner/errors/tests/MI/TestSuite/Test", pattern: "Test4.runtime.js"}});
							await chai.expect(runner.run()).to.be.rejectedWith(errors.MIRunnerError);
							runner.unloadTestFiles();
						})
					})
				});
			})
		})
	})
});