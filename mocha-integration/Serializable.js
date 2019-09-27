function Serializable(name) {
	this.name = name;
}
Serializable.prototype.serialize = function() { throw new Error("serialize() not implemented"); }
Serializable.prototype.constructor = Serializable;
module.exports = Serializable;
