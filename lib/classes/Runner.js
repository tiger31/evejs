const Exporter = require('./abstract/Exporter');
const Hooked = require('./mixins/Hooked');
const Seeder = require('./mixins/Seeder');
const Suite = require('./Suite');

/**
 * @class
 * @extends Exporter
 * @mixes Seeder
 * @mixes Hooked
 */
const Runner = class Runner extends Seeder(Hooked(Exporter)) {
	/**
	 * @type {Object}
	 */
	context = {};
	/**
	 * @type {Array.<Seed>}
	 */
	suites = [];
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
						suite: this.suite
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
	suite = (title, fn, config) => {
		const suite = new Suite({fn, name: title, runner: this}, config);
		this.suites.push(suite);
		return suite;
	};
};

module.exports = Runner;