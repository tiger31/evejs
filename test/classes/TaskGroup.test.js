const TaskGroup = require('../../lib/classes/TaskGroup');
const Task = require('../../lib/classes/Task');
const Foo = class extends require('../../lib/classes/mixins/TaskRunnable')(class {}) {
	constructor(f) {
		super();
		this.function = f;
	}
};

describe("TaskGroup class", () => {
	describe("Methods", () => {
		describe("TaskGroup.run", () => {
			it("Run parallel group", async () => {
				const arr = [];
				const r100 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(100)), 100))));
				const r200 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(200)), 200))));
				const r300 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(300)), 300))));
				const group = new TaskGroup([r200, r100, r300]);
				await expect(group.run()).to.not.be.rejected;
				expect(arr).to.have.ordered.members([100,200,300])
			});
			it("Run non-parallel group", async () => {
				const arr = [];
				const r100 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(100)), 100))));
				const r200 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(200)), 200))));
				const r300 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(300)), 300))));
				const group = new TaskGroup([r200, r100, r300], false);
				await expect(group.run()).to.not.be.rejected;
				expect(arr).to.have.ordered.members([200,100,300])
			});
			it("skipCondition affects tasks in group", async () => {
				const arr = [];
				const r100 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(100)), 100))));
				const r200 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(200)), 200))));
				const r300 = new Task(undefined, new Foo(() => new Promise((rs, rj) => setTimeout(() => rs(arr.push(300)), 300))));
				const group = new TaskGroup([r200, r100, r300], false);
				group.skipCondition = () => true;
				await expect(group.run()).to.not.be.rejected;
				expect(arr).to.have.ordered.members([200])
			})
		})
	})
});
