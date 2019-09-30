const test = require('../../../mocha-integration/TestFunction');
MISuite(() => {
	main(() => {
		const f = ({a}={}) => a + 2;
		const t = new test(f, {
			epic: "Main",
			severity: allure.SEVERITY.BLOCKER,
			feature: "sum",
			full: true,
			test: (res, conf) => {
				expect(res).to.be.equal(conf.a * conf.a);
			}
		});
		t({ title: "Test1", a: 2 });
		t({ title: "Test2", a: 3, severity: allure.SEVERITY.CRITICAL });
		t({ title: "Test3", a: 1, severity: 'trivial' });
	})
})
