const Runner = require('../../../lib/classes/Runner');

describe('Runner error handling', () => {
	describe('Runner', () => {
		describe('Seeds', () => {
			it('Seed config undefiled variable', () => {
				const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf1.js" }});
				chai.expect(runner).to.throw(ReferenceError, 'defined');
			});
			it('Seed config not an object', () => {
				const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf2.js" }});
				chai.expect(runner).to.throw(TypeError, 'Seed');
			});
			it('Seed config timeout isn\' a number', () => {
				const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf3.js" }});
				chai.expect(runner).to.throw(TypeError, 'Timeout');
			});
			it('Seed function isn\' a function', () => {
				const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/Seed", pattern: "*.seedconf4.js" }});
				chai.expect(runner).to.throw(TypeError, 'Seed');
			});
		});
		describe('MI', () => {
			describe('Seeds', () => {
				it('Seed config undefiled variable', () => {
					const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/MI/Seed", pattern: "*.seedconf1.js" }});
					chai.expect(runner).to.throw(ReferenceError, 'defined');
				});
				it('Seed config not an object', () => {
					const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/MI/Seed", pattern: "*.seedconf2.js" }});
					chai.expect(runner).to.throw(TypeError, 'Seed');
				});
				it('Seed config timeout isn\' a number', () => {
					const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/MI/Seed", pattern: "*.seedconf3.js" }});
					chai.expect(runner).to.throw(TypeError, 'Timeout');
				});
				it('Seed function isn\' a function', () => {
					const runner = () => new Runner({ test: { dir: "test/Runner/errors/tests/MI/Seed", pattern: "*.seedconf4.js" }});
					chai.expect(runner).to.throw(TypeError, 'Seed');
				});
			})
		})
	})
});