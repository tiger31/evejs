const Suite = require('./Suite');
const Mocha = require('./drivers/Mocha');

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
 	 * @param config
	 */
	constructor(config) {
		super({name: "Root"}, config);
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
	 * @param {Object} config - Config object
	 * @return {Suite} suite
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
	 * @type {Object.<string, Driver>}
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
	}

};

module.exports = Runner;