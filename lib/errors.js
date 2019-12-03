const MIError =  class MIError extends Error {
	constructor() {
		super();
	}
};

module.exports.MIError = MIError;

module.exports.MIConsistenceError = class MIConsistenceError extends MIError {
	constructor(obj) {
		super();
		this.message = `Nesting forbidden for this type of Runnable: ${obj.constructor.name}`;
		this.code = "MI_CONSISTENCE_ERROR";
		this.class = obj.constructor;
	}
};

module.exports.MITimeoutError = class MITimeoutError extends MIError {
	constructor(runnable, timeout) {
		super();
		this.timeout = timeout;
		this.runnable = runnable;
		this.message = `Timeout ${timeout}ms excided for ${runnable.constructor.name}`;
		this.code = "MI_TIMEOUT_ERROR"
	}
};

module.exports.MIHookNotFound = class MIHookNotFound extends MIError {
	constructor(runnable, hook) {
		super();
		this.hook = hook;
		this.runnable = runnable;
		this.message = `Hook "${hook} not found for runnable ${runnable.name}@${runnable.constructor.name}"`;
		this.code = 'MI_HOOK_NOT_FOUND'
	}
};

module.exports.MIFrameworkError = class MIFrameworkError extends MIError {
	constructor(error) {
		super();
		this.error = error;
		this.message = `Uncaught error while framework execution: ${error}`;
		this.code = 'MI_FRAMEWORK_ERROR';
	}
};

module.exports.MIDriverNotImplemented = class MIDriverNotImplemented extends MIError {
	constructor() {
		super();
		this.message = 'Driver exists, but functions some functions not implemented';
		this.code = 'MI_DRIVER_NOT_IMPLEMENTED'
	}
};

module.exports.MIRunnerError = class MIRunnerError extends MIError {
	constructor(message) {
		super();
		this.message = message;
		this.code = 'MI_RUNNER_FATAL';
	}
};

module.exports.MINotEmitter = class MINotEmitter extends MIError {
	constructor() {
		super();
		this.message = 'Trying to proxy events on something that do not have events';
		this.code = 'MI_NOT_EMITTER';
	}
};

module.exports.MITestsTreeError = class MITestsTreeError extends MIError {
	constructor(key, child, parent) {
		super();
		this.message = `Tests tree error with parameter "${key}", parent value: ${parent}, child value: ${child}`;
		this.code = 'MI_TESTS_TREE_ERROR'
	}
};

module.exports.MIIllegalState = class MIIllegalState extends MIError {
	constructor(obj, state, states) {
		super();
		const name = (obj.constructor && obj.constructor.name) ? obj.constructor.name : 'Object';
		this.message = `${name} has no state "${state}", states available: ${states.join(', ')}`;
		this.code = 'MI_ILLEGAL_STATE'
	}
};

module.exports.MIIllegalStateTransition = class MIIllegalStateTransition extends MIError {
	constructor(obj, from, to) {
		super();
		const name = (obj.constructor && obj.constructor.name) ? obj.constructor.name : 'Object';
		this.message = `${name} has to transition from state "${from.name}" with "${to}", transitions available with results: ${Object.keys(from.transitions).join(', ')}`;
		this.code = 'MI_ILLEGAL_STATE_TRANSITION'
	}
};

module.exports.MITestsTreeBuildError = class MITestsTreeBuildError extends MIError {
	constructor(name) {
		super();
		this.message = `Unable to sync framework node with runner, node name: ${name}`;
		this.code = 'MI_TESTS_TREE_BUILD_ERROR'
	}
};

module.exports.MIUndetectedFrameworkEntity = class MIUndetectedFrameworkEntity extends MIError {
	constructor(entities) {
		super();
		this.entities = entities;
		this.message = 'Undetected entities are not allowed by runner config';
		this.code = 'MI_UNDETECTED_FRAMEWORK_ENTITY'
	}
};

module.exports.MINotPassed = class MINotPassed extends MIError {
	constructor(tests) {
		super();
		this.message = `Total ${tests.length} tests failed`;
		this.tests = tests;
		this.code = 'MI_NOT_PASSED'
	}
};

module.exports.MISeedingFailed  = class MISeedingFailed extends MIError {
	constructor() {
		super();
		this.message = 'Seeding failed. See runner seeds or suites with RUN_INTERRUPT mode';
		this.code ='MI_SEEDING_FAILED';
	}
};