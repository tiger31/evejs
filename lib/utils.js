
module.exports.errorToOj = (error) => {
	if (!error) return;
	const err = (error instanceof Error) ? error : new Error(error);
	return {
		name: (err.code) ? err.code : err.name,
		message: err.message,
		stack: err.stack.split('\n').slice(1).join('\n')
	}
};

module.exports.types = {
	EVE_RUNNER: 'EVE_RUNNER',
	SEED: 'SEED',
	EVE_SUITE: 'EVE_SUITE',
	TEST_SUITE: 'TEST_SUITE',
	TEST: 'TEST'
};