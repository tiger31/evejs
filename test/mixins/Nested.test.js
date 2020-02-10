const Nested = require('../../lib/classes/mixins/Nested');

describe('Nested mixin', () => {
	let Inst;
	step('Implementation', () => {
		Inst = Nested(class {});
	});
	describe('Methods', () => {
		describe('Lock', () => {
			it('nested = false', () => {
				Inst.nested = false;
				const inst = new Inst();
				const inst2 = new Inst();
				expect(() => inst.lock()).to.not.throw();
				expect(() => inst2.lock()).to.throw(errors.MIConsistenceError);
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
		it('Release', () => {
			Inst.nested = false;
			const inst = new Inst();
			const inst2 = new Inst();
			expect(() => inst.lock()).to.not.throw();
			expect(() => inst2.lock()).to.throw(errors.MIConsistenceError);
			inst.release();
			expect(() => inst2.lock()).to.not.throw();
			inst2.release();
		});
		it('isNestingLocked', () => {
			const inst = new Inst();
			const inst2 = new Inst();
			inst.lock();
			expect(inst.isNestingLocked()).to.be.true;
			expect(inst2.isNestingLocked()).to.be.true;
			inst.release();
		})
	});
});
