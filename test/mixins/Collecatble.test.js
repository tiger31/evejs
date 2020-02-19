const Collectable = require('../../lib/classes/mixins/Collectable');

describe('Collectable mixin', () => {
	let Inst;
	step('Implementation', () => {
		Inst = Collectable(class  {})
	});
	describe('Methods', () => {
		describe('Collectable.collect', () => {
			it('Field as string', () => {
				const inst = new Inst();
				expect(() => inst.collect('foo')).to.not.throw();
				expect(inst._collectable).to.include.property(0);
				expect(inst._collectable[0]).to.include.property('field', 'foo');
				expect(inst._collectable[0]).to.include.property('as', 'foo');
				expect(inst._collectable[0]).to.not.include.property('transform');
			});
			it('Field as object', () => {
				const inst = new Inst();
				expect(() => inst.collect({field: 'foo', as: 'bar'})).to.not.throw();
				expect(inst._collectable).to.include.property(0);
				expect(inst._collectable[0]).to.include.property('field', 'foo');
				expect(inst._collectable[0]).to.include.property('as', 'bar');
			});
			it('Array of fields', () => {
				const inst = new Inst();
				expect(() => inst.collect({field: 'foo', as: 'bar'}, 'baz')).to.not.throw();
				expect(inst._collectable).to.have.lengthOf(2);
			});
			it('Field as object without one of required properties (field, as)', () => {
				const inst = new Inst();
				expect(() => inst.collect({field: 'foo'})).to.throw(TypeError);
				expect(() => inst.collect({as: 'foo'})).to.throw(TypeError);
			})
		});
		it('Collectable.clear', () => {
			const inst = new Inst();
			inst.collect('foo', 'bar');
			inst.clear();
			expect(inst._collectable).to.be.empty;
		});
		it('Collectable._retrieveValueFormPath', () => {
			const inst = new Inst();
			const obj = { foo: { bar: '123', baz: { foo: 7 }}};
			expect(inst._retrieveValueFromPath(obj, ['foo'])).to.be.equal(obj.foo);
			expect(inst._retrieveValueFromPath(obj, ['foo', 'bar'])).to.be.equal(obj.foo.bar);
			expect(inst._retrieveValueFromPath(obj, ['foo', 'baz', 'foo'])).to.be.equal(obj.foo.baz.foo);
			expect(inst._retrieveValueFromPath(obj, ['bar'])).to.be.null;
			expect(inst._retrieveValueFromPath(obj, [''])).to.be.null;
		});
		it('Collectable._placeValueByPath', () => {
			const inst = new Inst();
			const obj = {};
			inst._placeValueByPath(obj, ['foo'], 'bar');
			expect(obj).to.include.property('foo', 'bar');
			inst._placeValueByPath(obj, ['bar', 'baz'], 'foo');
			expect(obj).to.include.nested.property('bar.baz', 'foo');
			expect(() => inst._placeValueByPath(obj, [], 'foo')).to.throw(ReferenceError);
		});
	});
	describe('Properties', () => {
		it('Collectable.collected', () => {
			const inst = new Inst();
			inst.foo = { bar: 7 };
			inst.collect(
				'foo',
				{field: 'foo.bar', as: 'bar'},
				{field: 'foo.bar', as: 'foo.baz', transform: (bar) => bar * 2 }
			);
			const collected = inst.collected;
			expect(collected).to.include.property('foo');
			expect(collected).to.include.property('bar', inst.foo.bar);
			expect(collected).to.include.nested.property('foo.baz', inst.foo.bar * 2);
		})
	})
});