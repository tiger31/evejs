const Nested = require('../../lib/classes/mixins/Nested');

describe('Nested mixin', () => {
	let Inst;
	step('Implementation', () => {
		Inst = Nested(class {});
	});
	describe('Methods', () => {
		describe('Nested.lock', () => {
			it('nested = false', () => {
				Inst.nested = false;
				const inst = new Inst();
				expect(() => inst.lock()).to.not.throw();
				inst.release();
			});
			it('nested = true', () => {
				Inst.nested = true;
				const inst = new Inst();
				const inst2 = new Inst();
				expect(() => inst.lock()).to.not.throw();
				expect(() => inst2.lock()).to.not.throw();
			});
		});
		it('Nested.release', () => {
			Inst.nested = false;
			const inst = new Inst();
			const inst2 = new Inst();
			expect(() => inst.lock()).to.not.throw();
			expect(() => inst2.lock()).to.not.throw();
			inst.release();
			inst2.release();
		});
		it('Nested.isNestingLocked', () => {
			const inst = new Inst();
			const inst2 = new Inst();
			inst.lock();
			expect(inst.isNestingLocked()).to.be.true;
			expect(inst2.isNestingLocked()).to.be.true;
			inst.release();
		})
	});
});
