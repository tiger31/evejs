function Emitter(events, consumer) {
	this.events = {}; //Wut?
	this.consumer = consumer;
	this.register_events(events);
}
Emitter.prototype = {
	constructor: Emitter,
	str_to_events: function (str) {
		return str.split(/\s+/);
	},
	register_events: function (events) {
		const _this = this;
		this.str_to_events(events).forEach(function (element) {
			_this.events[element] = [];
		});
	},
	on: function (events, func) {
		const _this = this;
		this.str_to_events(events).forEach(function (element) {
			if (_this.events[element] !== undefined && _this.events[element] !== null) {
				_this.events[element].push(func);
			} else {
				throw new Error("Event " + element + " not supported");
			}
		});
	},
	addEventListener: this.on,
	off: function (events, func) {
		const _this = this;
		this.str_to_events(events).forEach(function (element) {
			if (_this.events[element] !== undefined && _this.events[element] !== null) {
				const index = _this.events[element].indexOf(func);
				_this.events[element].splice(index, 1);
			} else {
				throw new Error("Event " + element + " not supported");
			}
		});
	},
	removeEventListener: this.off,
	//While emitting, all the others args except event are passed to an event
	emit: function (event, ...args) {
		const _this = this;
		if (this.events[event] !== undefined && this.events[event] !== null) {
			this.events[event].forEach(function (func) {
				func.apply(_this.consumer, args);
			});
		} else {
			throw new Error("Event " + event + " not supported");
		}
	},
	trigger: this.emit
};
module.exports = Emitter;
