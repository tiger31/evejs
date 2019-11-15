module.exports = class MIError extends Error {
	constructor(message) {
		super(message);
		Object.defineProperty(this, "name", {           
			value: this.constructor.name
		});  
		Error.captureStackTrace(this, this.constructor);
	}	
}
