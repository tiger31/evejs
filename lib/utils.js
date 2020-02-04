
module.exports.errorToOj = (error) => {
	if (!error) return;
	const err = (error instanceof Error) ? error : new Error(error);
	return {
		name: (err.code) ? err.code : err.name,
		message: err.message,
		stack: err.stack.split('\n').slice(1).join('\n')
	}
};

module.exports.mix = (target, ...mixins) => {
	const mixes = target.__mixes || [];
	const child = mixins.reduce((target, mixin) => {
		mixes.push(mixin.name);
		return mixin(target);
	}, target);
	child.__mixes = mixes;
	return child;
};

module.exports.mixes = (target, mixin) => {
	const mixinName = (mixin instanceof Function) ? mixin.name : mixin;
	return target.__mixes && target.__mixes instanceof Array && target.__mixes.includes(mixinName);
};

module.exports.types = {
	EVE_RUNNER: 'EVE_RUNNER',
	SEED: 'SEED',
	EVE_SUITE: 'EVE_SUITE',
	TEST_SUITE: 'TEST_SUITE',
	TEST: 'TEST'
};