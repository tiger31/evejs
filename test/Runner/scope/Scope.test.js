const Runner = require('../../../lib/classes/Runner');

const scopes = [
	{ scope: 	'all', length: 2 },
	{ scope: 	'default', length: 1 },
	{ scope: 	'test', length: 1 },
	{ scope: 	'foo', length: 0 },
	{ scope: 	['default', 'foo'], length: 1 },
];

const rs = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, () => {
		const runner = new Runner({ scope: scopes, test: { dir: dir, pattern: "*.rs.js" }});
		runner.unloadTestFiles();
		chai.expect(runner.seeds).to.have.lengthOf(length)
	});
};

const rss = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, async () => {
		const runner = new Runner({ scope: scopes, test: { dir: dir, pattern: "*.rss.js" }});
		runner.unloadTestFiles();
		await chai.expect(runner.runSeeds()).to.not.be.rejected;
		chai.expect(runner.context.value).to.have.lengthOf(length);
	})
};

const ss = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, () => {
		const runner = new Runner({ scope: scopes, test: { dir: dir, pattern: "*.ss.js" }});
		runner.unloadTestFiles();
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.property('seeds')
			.and.to.have.lengthOf(length)
	});
};

const sss = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, async () => {
		const runner = new Runner({ scope: scopes, test: { dir: dir, pattern: "*.sss.js" }});
		runner.unloadTestFiles();
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.nested.property('context.value')
			.and.to.have.lengthOf(length);
	})
};

const tss = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, async () => {
		const runner = new Runner({ scope: scopes, test: { dir: dir, pattern: "*.tss.js" }});
		runner.unloadTestFiles();
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.nested.property('suites[0]')
			.and.include.property('tests')
			.and.to.have.lengthOf(length);
	})
};

const ts = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, async () => {
		const runner = new Runner({ scope: scopes, test: { dir: dir, pattern: "*.ts.js" }});
		runner.driver.test = (title, fn) => { fn(); };
		runner.unloadTestFiles();
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.nested.property('context.value')
			.and.to.have.lengthOf(length);
	})
};

const rsu = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, async () => {
		const runner = new Runner({scope: scopes, test: {dir: dir, pattern: "*.rsu.js"}});
		runner.driver.test = (title, fn) => { fn();	};
		runner.unloadTestFiles();
		chai.expect(runner.MISuites).to.have.lengthOf(length);
	})
};

const tsss = (scopes, length, dir) => {
	it(`Scope: ${scopes}`, async () => {
		const runner = new Runner({scope: scopes, test: {dir: dir, pattern: "*.tsss.js"}});
		runner.driver.test = (title, fn) => { fn();	};
		runner.unloadTestFiles();
		await chai.expect(runner.run()).to.not.be.rejected;
		chai.expect(runner.MISuites).to.include.property('0')
			.and.include.property('suites')
			.and.to.have.lengthOf(length)
	})
};


describe('Runner scopes', () => {
	describe('Scope function availability', () => {
		const dir = 'test/Runner/scope/tests';
		describe('Runner scope', () => {
			for (const s of scopes)
				rs(s.scope, s.length, dir);
		});
		describe('Runner\'s seed scope', () => {
			for (const s of scopes)
				rss(s.scope, s.length, dir);
		});
		describe('Suite scope', () => {
			for (const s of scopes)
				ss(s.scope, s.length, dir);
		});
		describe('Suite\'s seed scope', () => {
			for (const s of scopes)
				sss(s.scope, s.length, dir);
		});
		describe('Test suite scope', () => {
			for (const s of scopes)
				tss(s.scope, s.length, dir);
		});
		describe('Test scope', () => {
			for (const s of scopes)
				ts(s.scope, s.length, dir);
		})
	});
	describe('Scope by config', () => {
		const dir = 'test/Runner/scope/tests2';
		describe('Runner scoped seed', () => {
			for (const s of scopes)
				rs(s.scope, s.length, dir);
		});
		describe('Runner\'s scoped MISuites', () => {
			for (const s of scopes)
				rsu(s.scope, s.length, dir);
		});
		describe('Suite scoped seeds', () => {
			for (const s of scopes)
				ss(s.scope, s.length, dir);
		});
		describe('Suite\'s seed scope', () => {
			for (const s of scopes)
				tsss(s.scope, s.length, dir);
		});
		describe('Test suite scoped test', () => {
			for (const s of scopes)
				tss(s.scope, s.length, dir);
		});
	})
});