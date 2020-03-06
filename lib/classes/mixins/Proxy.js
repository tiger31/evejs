const EventEmitter = require('events').EventEmitter;
const errors = require('../../errors');
/**
 * @description 
 * Adds functionality to proxy events from another EventEmitter
 * @param {object} Base - Base class
 * @returns {*} mixed
 * @mixin
 */
module.exports = Base => class extends Base {
	/**
	 * @description
	 * Proxies events from EventEmitter 'on' onto this
	 * @param {object|string|Array.<string|object>} events - Event to proxy
	 * @param {object.<EventEmitter>} on - Object with event emitter
	 */
	proxy(events, on) {
		const arr = (events instanceof Array) ? events : [ events ];
		for (const event of arr) {
			if (event instanceof Object)
				this._proxyEvent(event.from, event.to, on, this);
			else
				this._proxyEvent(event, event, on, this);
		}
	}

	/**
	 * @description
	 * Proxies events from this onto EventEmitter 'to'
	 * @param {object|string|Array.<string|object>} events - Event to proxy
	 * @param {object.<EventEmitter>} to - Object with event emitter
	 */
	proxyTo(events, to) {
		const arr = (events instanceof Array) ? events : [ events ];
		for (const event of arr) {
			if (event instanceof Object)
				this._proxyEvent(event.from, event.to, this, to);
			else
				this._proxyEvent(event, event, this, to);
		}
	}

	/**
	 * @description
	 * Proxies event 'from' on another runnable to event 'to' on this runnable
	 * @param {string} from - From event
	 * @param {string} to - To event
	 * @param {object.<EventEmitter>} on - Target object
	 * @param {object.<EventEmitter>} emitter - Event consumer
	 * @private
	 * @throws errors.MINotEmitter - Trying to proxy on object not extended from EventEmitter
	 * @throws ReferenceError - Proxy event on itself
	 */
	_proxyEvent(from, to, on, emitter) {
		if (!(on instanceof EventEmitter))
			throw new errors.MINotEmitter();
		on.on(from, (...args) => emitter.emit(to, ...args));
	}
};