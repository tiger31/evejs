const Task = require('../../lib/classes/Task');
const Foo = require('../../lib/classes/mixins/TaskRunnable')(class {});

describe("Task class", () => {
	describe('Methods', () => {
		describe('Task.run', () => {
			it("Run with hooks", async () => {
				const arr = [];
				const runnable = new Foo();
				runnable.function = () => { arr.push('runnable') };
				const task = new Task(
					{ run: () => { arr.push('before') } },
					runnable,
					{ run: () => { arr.push('after') } },
				);
				await expect(task.run()).to.not.be.rejected;
				expect(arr).to.have.ordered.members(['before', 'runnable', 'after'])
			});
			it('Run with undefined hook', async () => {
				const arr = [];
				const runnable = new Foo();
				runnable.function = () => { arr.push('runnable') };
				const task = new Task(
					undefined,
					runnable,
					{ run: () => { arr.push('after') } },
				);
				await expect(task.run()).to.not.be.rejected;
				expect(arr).to.have.ordered.members(['runnable', 'after'])
			});
			it('Runnable with ignore flag should be ignored', async () => {
				let flag = 0;
				let flag2 = 0;
				const Bar = class extends Foo {
					ignore() {
						flag = 1;
					}
				};
				const runnable = new Bar();
				runnable.function = () => flag2 = 1;
				runnable.skip = true;
				const task = new Task(undefined, runnable);
				await expect(task.run()).to.not.be.rejected;
				expect(flag).to.be.equal(1);
				expect(flag2).to.be.equal(0);
			})
		});
		describe('Task.ignore', () => {
			it('Ignore propagates on runnable', () => {
				let flag = 0;
				const Bar = class extends Foo {
					ignore() {
						flag = 1;
					}
				};
				const task = new Task(undefined, new Bar());
				expect(() => { task.ignore() }).to.not.throw();
				expect(flag).to.be.equal(1)
			})
		})
	})
});