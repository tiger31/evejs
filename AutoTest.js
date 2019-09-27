require('@babel/register');
const TestFunction = require('./TestFunction.js');
const MakeFunctionTag = "MakeFunction"
const ConfigSymbol = Symbol('TestFunctionConfig');
const FunctionSymbol = Symbol('Funcion');
const isHolder = (obj) => obj[Symbol.toStringTag] === "FunctionsHolder";
const testsVarKey = "#__test__";
const ignore = [testsVarKey, '__wrap', '__parent', 'constructor', 'test'];

//Custom object map values
Object.map = function (obj, func) {
	return Object.keys(obj).reduce((o, key) => {o[key] = func(obj[key]);return o;}, {});
}

const AutoTest = class AutoTest {
	[testsVarKey] = {};
	constructor() {
		this.__wrap(Object.getOwnPropertyNames(this.__proto__).filter(key => !ignore.includes(key) && !key.startsWith('_')));
		this.test = () => Object.map(this[testsVarKey], func => {
			if (func instanceof FunctionsHolder)
				return func.test();
			return func;
		});
	}

	__wrap(keys) {
		for (let key of keys) {	
			const func = this[key];
			//This part is duplicated with FunctionHolder constructor
			//But as far as vars are private, we have no access to it from outside the class
			if (func instanceof Function && func[Symbol.toStringTag] === MakeFunctionTag) {
				const f = func();
				this[key] = (...args) => f[FunctionSymbol].apply(this, ...args);
				this[testsVarKey][key] = new TestFunction((...args) => this[key].call(this, ...args), f[ConfigSymbol]) 
			} else if (func instanceof Function) {
				this[testsVarKey][key] = new TestFunction((...args) => this[key].call(this, ...args), { 
					title: `${func.name} test`,
					full: false, 
					reject: false,
				});
			} else if (func instanceof FunctionsHolder) {
				func.parent = { _: this };
				this[testsVarKey][key] = func;
			}
		}
	}

	static create(...args) {
		const inst = new this(...args);
		if (inst instanceof Promise) {
			return new Promise((rs, rj) => {
				inst.then((res) => {
					res.__wrap(Object.getOwnPropertyNames(res).filter(key => !ignore.includes(key) && !key.startsWith('_')));
					rs(res);
				})
			});
		} else {
			inst.__wrap(Object.getOwnPropertyNames(inst).filter(key => !ignore.includes(key) && !key.startsWith('_')));
			return inst;
		}
	}

}


const FunctionsHolder = class FunctionsHolder {
	[testsVarKey] = {};
	parent = { _: undefined };
	constructor(functions) {
		if (functions.test)
			throw new Error("Can't override reserved property \"test\" in FunctionsHolder");
		else {
			for (let key in functions) {
				const func = functions[key]
				if (func instanceof Function && func[Symbol.toStringTag] === MakeFunctionTag) {
					const f = func();
					this[key] = (...args) => this.contextCall(f[FunctionSymbol], args);
					//this[key] = (...args) => f[FunctionSymbol].call(this.parent._, ...args);
					this[testsVarKey][key] = new TestFunction((...args) => this[key].call(this.parent._, ...args), f[ConfigSymbol]) 
				} else if (func instanceof Function) {
					this[key] = (...args) => func.call(this.parent._, ...args);
					this[testsVarKey][key] = new TestFunction((...args) => this[key].call(this.parent._, ...args), { 
						title: `${func.name} test`,
						full: false, 
						reject: false,
					});
				} else if (func instanceof FuntionsHolder) {
					func.parent = this.parent;
				} else {
					this[key] = func;
				}
			}
		}
	}
	contextCall(fn, args) {
		return fn.call(this.parent._, ...args);
	}
	test = () => Object.map(this[testsVarKey], func => {
		if (func instanceof FunctionsHolder)
			return func.test();
		return func;
	});
}

module.exports =  {
	AutoTest: AutoTest,
	FunctionsHolder: FunctionsHolder,
	make: (func, conf) => { 
		const f = () => ({[FunctionSymbol]: func, [ConfigSymbol]: conf});
		f[Symbol.toStringTag] = MakeFunctionTag;
		return f;
	},
	isHolder: isHolder,
	Config: ConfigSymbol,
	Function: FunctionSymbol,
}
