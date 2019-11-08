const mocha = require('mocha');

const chai = require('chai');
chai.use(require('chai-as-promised'))
const expect = chai.expect;
const assert = chai.assert;

const reserved = ['title', 'step', 'full', 'test', 'err', 'reject', 'feature', 'severity', 'epic'];

module.exports = class TestFunction {
	/**
	 * @class
	 * @summary
	 * Returns function, that applies mocha and chai to given function.
	 * 
	 * @extends Function
	 *
	 * @public
	 * @param {Function} fn - Tested function
	 * @param {string} config.title - Mocha test title
	 * @param {bool} [config.step=false] - User step from mocha-steps instead of mocha's it
	 * @param {bool} [config.full=false] - Apply specified chai's function's.
	 * @param {Function} [config.test] - Test function over "fn" result
	 * @param {Function} [config.err] - Test function over "fn" rejection
	 * @param {bool} [config.reject=false] - If "true", checks that "fn" returned promise and it was rejected
	 * @param {string} [config.feature] - Allure feature argument
	 * @param {string} [config.severity="normal"] - Allure test severity argument
	 * @param {string} [config.epic] - Allure epic ergument
	 * @returns {TestFunction}
	 */
	constructor(fn, config) {
		const stepFunction = step;
		const testFunction = function (conf, argfn) {
			//Here i actually forgot that my "step" variable rewrites mocha's function
			//Because earlier it was an object, and there wes no destructuring assignment
			//So i have to make a link to mocha's step earlier
			const configObject = Object.assign({}, config, conf);
			let {title, step, full, test, err, reject, feature, severity, epic} = configObject;
			//Check if default value needed
			const mfn = (step) ? stepFunction : it;
			err = (err) ? err : onErr;
			test = (test) ? test : _test;
			//
			mfn(title, async () => {
				let args = {};
				if (argfn) 
					args = await argfn();
				args = Object.assign({}, configObject, args)
				const result = fn(args);
				//Allure args
				Object.keys(args).forEach(a => { if(!reserved.includes(a)) { console.log(a); allure.addArgument(a, args[a]) }});
				if (feature || global.suiteFeature) allure.feature(feature || global.suiteFeature);
				if (epic || global.suiteEpic) allure.epic(epic || global.suiteEpic);
				if (severity) allure.severity(severity);
				//End allure args
				if (result instanceof Promise || (result.then instanceof Function && result.catch instanceof Function))
					if (!full)
						await (reject ? expect(result).to.be.rejected : expect(result).to.not.be.rejected);
					else
						await result.then(res => {
							if (!reject)
								return test(res, args);
							else
								throw new chai.AssertionError("Promise should've been rejected", res);
								//assert.fail("Promise should've been rejected");	
						}).catch(error => err(error, args));
				else
					return test(result, args);
			});
		};
		//Overriding function prototype, so we actually can check that our function is an instance of TestFunction
		testFunction.__proto__ = TestFunction.__proto__;
		testFunction[Symbol.toStringTag] = "TestFunction";
		//Case when function returning itself without runnig with present config
		//Used for passig test function into other's rejection cases
		testFunction.with = (conf) => new TestFunction(fn, Object.assign({}, config, conf));
		return testFunction;
	}
}

const _test = (res, config) => {
	console.warn(`Test function for test "${config.title}" was not specified, fallback to default. See '_test in TestFunction.js'`);
	return expect(res).to.be.ok
} //'Ok' is not good, but default tester should not be ever use it;
const onErr = (err) =>  {
	if (err instanceof chai.AssertionError)
		 throw err;
	return assert.fail(`${err.message}. Additional data: ${ (err.response && err.response.data) ? JSON.stringify(err.response.data) : "Not present" }`);	
}
