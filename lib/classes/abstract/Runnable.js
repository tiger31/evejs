const EventEmitter = require('events').EventEmitter;
const Exporter = require('./Exporter');
const errors = require('../../errors');
/**
 * @abstract
 * @class
 * @augments Exporter
 * @type {Runnable}
 * @event begin - Start of main function execution
 * @event end - End of main function execution
 */
const Runnable = class Runnable extends Exporter {
	context = {};
	name = '';
	config;
	fn;
	timer;

	/**
	 * @param {object} args - Runnable args object
	 * @param {Function} args.fn - Main function for Runnable
	 * @param {object} args.context - Main function execution context
	 * @param {string} args.name - Runnable title
	 * @param {object} config - Config object
	 */
	constructor({fn, name, context = {}} = {}, config) {
		super();
		this.fn = fn;
		this.name = name;
		this.context = context;
		this.config = Object.assign({}, this.constructor.default, config);
		//Deep config merge if needed
		if (this.constructor._deep.length) {
			for (const deep of this.constructor._deep) {
				const index = deep.lastIndexOf('.');
				const prop = (index === -1) ? '': deep.slice(0, index);
				const propEnd = (index === -1) ? deep : deep.slice(index);
				const def = this.constructor._getDeep(this.constructor.default, prop)[propEnd];
				const n = this.constructor._getDeep(config, deep);
				this.constructor._getDeep(this.config, prop)[propEnd] = Object.assign({}, def, n);
			}
		}
		//If another runnable already running, forbids creating nested runnables
		if (!this.constructor.nested && this.nest())
			throw new errors.MIConsistenceError(this);
		//When runnable started, controls nesting execution
		this.on(this.constructor.events.EVENT_RUNNABLE_BEGIN, () => {
			if (this.constructor.nested !== true) {
				const prop = global[this.constructor.consistenceProperty];
				if (prop) {
					prop[this.constructor.consistenceKey] = true;
				} else {
					global[this.constructor.consistenceProperty] = {
						[this.constructor.consistenceKey]: true
					};
				}
			}
			this.emit(this.constructor.events.EVENT_EXPORT_SETUP);
		});
		this.on(this.constructor.events.EVENT_RUNNABLE_END, () => {
			this.emit(this.constructor.events.EVENT_EXPORT_TEARDOWN);
			if (!this.constructor.nested)
				global[this.constructor.consistenceProperty][this.constructor.consistenceKey] = false;
		});
	}

	/**
	 * @description
	 * Returns true if nesting is forbidden now
	 * @returns {boolean} isNestingForbidden
	 */
	nest() {
		return (global[this.constructor.consistenceProperty]) ? global[this.constructor.consistenceProperty][this.constructor.consistenceKey] : false;
	}
	/**
	 * @description
	 * Locks nesting prop if it's not allowed and runs main function
	 */
	async run() {
		this.emit(this.constructor.events.EVENT_RUNNABLE_BEGIN);
		await this.delayed().catch((err) => {
			this.emit(this.constructor.events.EVENT_RUNNABLE_END);
			throw err;
		});
		this.emit(this.constructor.events.EVENT_RUNNABLE_END);
	}

	/**
	 * @description
	 * Sets timeout value for runnable
	 * @param {number} value - Timeout duration
	 * @returns {Runnable} this
	 */
	timeout(value) {
		this.config.timeout = value;
		return this;
	}

	/**
	 * @description
	 * Calls main function with max execution time
	 * @async
	 * @throws errors.MITimeoutError
	 * @returns {Promise|*} any
	 */
	async delayed() {
		if (this.config.timeout > 0) {
			return new Promise((resolve, reject) => {
				this.timer = setTimeout(() => {
					const error = new errors.MITimeoutError(this, this.config.timeout);
					reject(error);
				}, this.config.timeout);
				try {
					const result = this.fn(this.context);
					if (result instanceof Promise)
						result.then(resolve).catch(reject);
					else resolve();
				} catch (error) {
					reject(error);
				}
			});
		} else return this.fn(this.context);
	}

	/**
	 * @description
	 * Proxies events from runnable 'on' onto this
	 * @param {string|Array.<string|object>} events - Event to proxy
	 * @param {object.<EventEmitter>} on - Object with event emitter
	 */
	proxy(events, on) {
		const arr = (events instanceof Array) ? events : [ events ];
		for (const event of arr) {
			if (event instanceof Object)
				this._proxyEvent(event.from, event.to, on);
			else
				this._proxyEvent(event, event, on);
		}
	}

	/**
	 * @description
	 * Proxies event 'from' on another runnable to event 'to' on this runnable
	 * @param {string} from - From event
	 * @param {string} to - To event
	 * @param {object.<EventEmitter>} on - Target object
	 * @private
	 * @throws errors.MINotEmitter - Trying to proxy on object not extended from EventEmitter
	 * @throws ReferenceError - Proxy event on itself
	 */
	_proxyEvent(from, to, on) {
		if (on === this)
			throw new ReferenceError('Cannot proxy event on itself');
		if (!(on instanceof EventEmitter))
			throw new errors.MINotEmitter();
		on.on(from, (...args) => this.emit(to, ...args));
	}

	/**
	 * @description
	 * Returns deep property if it exists
	 * @param {object} object - Any object
	 * @param {string} property - Object.property
	 * @static
	 * @private
	 * @returns {*} deepProperty
	 */
	static _getDeep(object, property) {
		const path = property.split('.');
		let value = object;
		for (const prop of path) {
			if (!object || !object[prop]) {
				value = (prop === '') ? value : null;
				break;
			}
			value = object[prop];
		}
		return value;
	}


	/**
	 * @description
	 * Default config object for runnable
	 * @static
	 * @type {object}
	 */
	static default = {
		timeout: 2000
	};

	/**
	 * @description
	 * If 'true', allows nesting for this Runnable's child class
	 * @example
	 * //Let's imagine, this runnable exports global function 'runnable' that creates class instance somewhere
	 * runnable(() => {
	 *   console.log("Depth 1")
	 *   //So, this runnable call wii throw error if 'nested' param set to false, else there will be no errors
	 *   runnable(() => {
	 *     console.log("Depth 2")
	 *   })
	 * })
	 * @static
	 * @type {boolean}
	 */
	static nested = false;

	/**
	 * @static
	 * @type {string}
	 */
	static consistenceKey = 'Runnable';

	/**
	 * @static
	 * @type {string}
	 */
	static consistenceProperty = 'MI_CONSISTENCE';

	/**
	 * @static
	 * @type {Array.<string>}
	 */
	static _deep = [];
};

/**
 * @memberof Runnable
 * @static
 * @enum {string}
 */
Runnable.events.EVENT_RUNNABLE_BEGIN = 'begin';
Runnable.events.EVENT_RUNNABLE_END = 'end';



module.exports = Runnable;