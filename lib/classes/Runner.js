const Suite = require('./Suite');
const Mocha = require('./drivers/Mocha');

/**
 * @class
 * @augments Suite
 * @mixes Hooked
 */
const Runner = class Runner extends Suite {
	/**
	 * @type {object}
	 */
	context = {};
	/**
	 * @type {Array.<Suite>}
	 */
	MISuites = [];
	/**
	 * @external Driver
	 * @type {Driver}
	 */
	driver;

	/**
	 * @param {object} config - Runner configuration
	 */
	constructor(config) {
		super({name: 'Root'}, config);
		this.driver = new this.config.driver();
		//Setting custom getter

		Object.defineProperty(this, 'exports', {
			get() {
				return {
					controls: {
						seed: this.seed,
						emerge: this.emerge,
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
	 * @param {object} config - Config object
	 * @returns {Suite} suite
	 */
	mi = (title, fn, config) => {
		const suite = new Suite({fn, name: title, runner: this}, config);
		this.MISuites.push(suite);
		return suite;
	};

	/**
	 * @description
	 * Runner drivers list
	 * @static
	 * @type {object.<string, Driver>}
	 * @enum
	 */
	static drivers = {
		mocha: Mocha
	};

	/**
	 * @override
	 * @see Runnable
	 */
	static default = {
		timeout: -1,
		mode: this.mode.INTERRUPT_RUN,
		behavior: this.behaviour.INTERRUPT,
		driver: this.drivers.mocha
	};

};

module.exports = Runner;