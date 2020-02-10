const Runnable = require('../../lib/classes/mixins/Runnable');

describe('Runnable Mixin', () => {
	let Inst;
	step('Implementation', () => {
		Inst = Runnable(class {});
	});
	describe('Parameters', () => {
		describe('Runnable.function', () => {
			it('Set function', () => {
				const inst = new Inst();
				const f = () => {};
				inst.function = f;
				expect(inst.function).to.be.equal(f);
			});
			it('Set non-function value', () => {
				const inst = new Inst();
				const f = 'function';
				expect(() => { inst.function = f }).to.throw(TypeError);
			})
		});
		describe('Runnable.timeout', () => {
			it('Set timeout', () => {
				const inst = new Inst();
				const timeout = 500;
				inst.timeout = timeout;
				expect(inst.timeout).to.be.equal(timeout);
			});
			it('Set non-number value', () => {
				const inst = new Inst();
				expect(() => { inst.timeout = 'foo' }).to.throw(TypeError);
			})
		});
		describe('Runnable.title', () => {
			it('Set title', () => {
				const inst = new Inst();
				const title = 'foo bar';
				inst.title = title;
				expect(inst.title).to.be.equal(title);
			});
			it('Set non-string value', () => {
				const inst = new Inst();
				expect(() => { inst.title = {a: 1} }).to.throw(TypeError);
			})
		})
	});
	describe('Methods', () => {
		describe('Runnable.delayed', () => {
			describe('Error handling', () => {
				it('Run sync function', async () => {
					const inst = new Inst();
					inst.function = () => 'foo';
					await expect(wrapper(inst.delayed())).to.eventually.be.equal('foo');
				});
				it('Run async function', async () => {
					const inst = new Inst();
					inst.function = () => Promise.resolve('foo');
					await expect(wrapper(inst.delayed())).to.eventually.be.equal('foo');
				});
				it('Throw sync exception', async () => {
					const inst = new Inst();
					inst.function = () => { throw new Error('foo'); };
					await expect(wrapper(inst.delayed())).to.be.rejectedWith(Error, 'foo');
				});
				it('Throw async exception', async () => {
					const inst = new Inst();
					inst.function = async () => { throw new Error('foo') };
					await expect(wrapper(inst.delayed())).to.be.rejectedWith(Error, 'foo');
				});
			});
			describe('Timeout behaviour', () => {
				it('Timeout excided exception', async () => {
					const inst = new Inst();
					inst.timeout = 300;
					inst.function = () => new Promise((rs, rj) => {
						setTimeout(() => { rs('foo') }, 500);
					});
					await expect(wrapper(inst.delayed())).to.be.rejectedWith(errors.MITimeoutError);
				});
				it('Changing Runnable.timeout affects timeout length', async () => {
					const inst = new Inst();
					inst.function = () => new Promise((rs, rj) => {
						setTimeout(() => { rs('foo') }, 500);
					});
					await expect(wrapper(inst.delayed())).to.eventually.be.equal('foo');
					inst.timeout = 300;
					await expect(wrapper(inst.delayed())).to.be.rejectedWith(errors.MITimeoutError);
				});
				it('Setting timeout below zero, removes execution limit', async () => {
					const inst = new Inst();
					inst.timeout = -1;
					inst.function = () => new Promise((rs, rj) => {
						setTimeout(() => { rs('foo') }, 2500);
					});
					await expect(wrapper(inst.delayed())).to.eventually.be.equal('foo');
				}).timeout(3000);
			});
		});
	})
});
