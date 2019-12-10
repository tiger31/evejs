
module.exports.errorToOj = (error) => {
	const err = (error instanceof Error) ? error : new Error(error);
	return {
		name: err.name,
		message: err.message,
		stack: err.stack.split('\n').slice(1).join('\n')
	}
};