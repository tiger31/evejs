const errors = require('../../errors');

const Hooked = (Base) => {
	// noinspection UnnecessaryLocalVariableJS
	/**
	 * @mixin Hooked
	 */
	const temp = class extends Base {
	};

	return temp;
};

module.exports = Hooked;