const Suite = require('./Suite');

/**
 * @class
 * @extends Suite
 * @mixes Hooked
 */
const Runner = class Runner extends Suite {
	/**
	 * @type {Object}
	 */
	context = {};
	/**
	 * @type {Array.<Suite>}
	 */
	MISuites = [];
	/**
	 * @type {Driver}
	 */
	driver;

	/**
 	 * @param props
	 */
	constructor(props) {
		super(props);
		//Setting custom getter

		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						seed: this.seed,
						emerge: this.emerge,
						suite: this.suite,
						test: this.test,
						mi: this.mi
					},
					hooks: Object.entries(this.hooks).reduce((o, hook) => { o[hook[0]] = hook[1].export; return o; }, {})
				};
			}
		});
	}

	/**
	 * @description
	 * Creates new suite
	 * @param {string} title - Suite title
	 * @param {Function} fn - Suite function
	 * @param {Object} config - Config object
	 * @return {Suite} suite
	 */
	mi = (title, fn, config) => {
		const suite = new Suite({fn, name: title, runner: this}, config);
		this.MISuites.push(suite);
		return suite;
	};
};

module.exports = Runner;