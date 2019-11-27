module.exports.MIConsistenceError = class MIConsistenceError extends Error {
	constructor(obj) {
		super();
		this.message = `Nesting forbidden for this type of Runnable: ${obj.constructor.name}`;
		this.code = "MI_CONSISTENCE_ERROR";
		this.class = obj.constructor;
	}
};

module.exports.MITimeoutError = class MITimeoutError extends Error {
	constructor(runnable, timeout) {
		super();
		this.timeout = timeout;
		this.runnable = runnable;
		this.message = `Timeout ${timeout}ms excided for ${runnable.constructor.name}`;
		this.code = "MI_TIMEOUT_ERROR"
	}
};

module.exports.MIHookNotFound = class MIHookNotFound extends Error {
	constructor(runnable, hook) {
		super();
		this.hook = hook;
		this.runnable = runnable;
		this.message = `Hook "${hook} not found for runnable ${runnable.name}@${runnable.constructor.name}"`;
		this.code = 'MI_HOOK_NOT_FOUND'
	}
};

module.exports.MIFrameworkError = class MIFrameworkError extends Error {
	constructor(error) {
		super();
		this.error = error;
		this.message = `Error occurred in suite's main block. Looks like it's not problem with MI: ${error}`;
		this.code = 'MI_FRAMEWORK_ERROR';
	}
};

module.exports.MIDriverNotImplemented = class MIDriverNotImplemented extends Error {
	constructor() {
		super();
		this.message = 'Driver exists, but functions some functions not implemented';
		this.code = 'MI_DRIVER_NOT_IMPLEMENTED'
	}
};

module.exports.MIRunnerError = class MIRunnerError extends Error {
	constructor(message) {
		super();
		this.message = message;
		this.code = 'MI_RUNNER_FATAL';
	}
};

module.exports.MINotEmitter = class MINotEmitter extends Error {
	constructor() {
		super();
		this.message = 'Trying to proxy events on something that do not have events';
		this.code = 'MI_NOT_EMITTER';
	}
};

module.exports.MITestsTreeError = class MITestsTreeError extends Error {
	constructor(key, child, parent) {
		super();
		this.message = `Tests tree error with parameter "${key}", parent value: ${parent}, child value: ${child}`;
		this.code = 'MI_TESTS_TREE_ERROR'
	}
};

module.exports.MIIllegalState = class MIIllegalState extends Error {
	constructor(obj, state, states) {
		super();
		const name = (obj.constructor && obj.constructor.name) ? obj.constructor.name : 'Object';
		this.message = `${name} has no state "${state}", states available: ${states.join(', ')}`;
		this.code = 'MI_ILLEGAL_STATE'
	}
};

module.exports.MIIllegalStateTransition = class MIIllegalStateTransition extends Error {
	constructor(obj, from, to) {
		super();
		const name = (obj.constructor && obj.constructor.name) ? obj.constructor.name : 'Object';
		this.message = `${name} has to transition from state "${from.name}" with "${to}", transitions available with results: ${Object.keys(from.transitions).join(', ')}`;
		this.code = 'MI_ILLEGAL_STATE_TRANSITION'
	}
};