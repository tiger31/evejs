const EventEmitter = require('events').EventEmitter;

/**
 * @description
 * Abstract class
 * @class
 * @abstract
 * @event export - Exports everything from class field "exports" into global space
 * @event teardown - Removes all exports from global space
 */
const Exporter = class Exporter extends EventEmitter {
	globals = {};
	exports = {};

	constructor() {
		super();
		this.on(Exporter.events.EVENT_EXPORT_SETUP, (group) => {
			const target = this.flatExports(group);
			for (const key in target) {
				// noinspection JSUnfilteredForInLoop
				this.globals[key] = global[key];
				// noinspection JSUnfilteredForInLoop
				global[key] = target[key];
			}
		});
		this.on(Exporter.events.EVENT_EXPORT_TEARDOWN, (group) => {
			const target = this.flatExports(group);
			for (const key in target) {
				// noinspection JSUnfilteredForInLoop
				global[key] = this.globals[key];
			}
		});
	}

	/**
	 * @description
	 * Flats exports from groups
	 * @private
	 * @param {string} group
	 * @return {Object} exports
	 */
	flatExports(group) {
		if (group && !this.exports[group])
			throw new ReferenceError(`Export group "${group}" does not exist`);
		const target = (group) ? this.exports[group] : this.exports;
		// noinspection JSValidateTypes
		return Object.keys(target).reduce((o, p) => {
			if (target[p] instanceof Object && target[p].constructor.name === 'Object' && !group)
				Object.assign(o, target[p]);
			else
				o[p] = target[p];
			return o;
		}, {});
	}

	static events = {
		EVENT_EXPORT_SETUP: 'export',
		EVENT_EXPORT_TEARDOWN: 'teardown'
	};

};


module.exports = Exporter;