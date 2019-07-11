module.exports = {
	red: (str) => `\x1b[0;31m${str}\x1b[0m`,
	green: (str) => `\x1b[0;32m${str}\x1b[0m`,	
	yellow: (str) => `\x1b[0;33m${str}\x1b[0m`,
	default: (str) => `\x1b[0;39m${str}\x1b[0m`,
	blue: (str) => `\x1b[0;34m${str}\x1b[0m`
}
