const Seed = require('../Seed');
const Suite = require('../Suite');
const tty = require('tty');
/**
 * @class
 */
const Reporter = class Reporter {
	/**
	 * @description
	 * Lines count
	 * @type {number}
	 */
	y = 0;
	/**
	 * @description
	 * TTY width
	 * @type {number}
	 */
	width = 64;
	/**
	 * @description
	 * Is stdout tty
	 * @type {boolean}
	 */
	istty = true;
	/**
	 * @param {Runner} runner
	 */
	constructor(runner) {
		this.runner = runner;
		this.istty = process.stdout.isTTY;
		if (this.istty)
			this.width = Math.min((process.stdout.getWindowSize) ? process.stdout.getWindowSize()[0] : tty.getWindowSize()[1], 64);
	}

	/**
	 * @description
	 * Writes string in stdout, remembering positioning
	 * @param {string} str - String
	 */
	write(str) {
		process.stdout.write(`${Buffer.from(str)}\n`);
		this.y++;
	}

	/**
	 * @description
	 * Runs on seeding state to show seeds statuses
	 */
	seeding() {
		/**
		 * @external Suite
		 * @param {Suite} runnable - Runnable
		 */
		const runnable = (runnable) => {
			const max = this.width - 8;
			const pos = this.y;
			const name = this.constructor.modify(runnable.name.padEnd(max, ' '), ['bold']);
			const sign = `${this.constructor.mode[runnable.config.mode]}${this.constructor.behaviour[runnable.config.behaviour]}`;
			this.write(`${name} ${this.constructor.status[runnable.seeded]} ${sign}`);
			runnable.on(Suite.events.SEEDING_STATUS_CHANGED, () => {
				this.rewrite(pos, `${name} ${this.constructor.status[runnable.seeded]} ${sign}`)
			})
		};

		/**
		 * @param {Seed} seed - Seed
		 */
		const seed = (seed) => {
			const max = this.width - 8;
			const pos = this.y; //Saving current y
			const name = `    ${seed.name.padEnd(max - 4, ' ')}`;
			this.write(`${name} ${this.constructor.status[seed.status]}`);
			seed.on(Seed.events.EVENT_SEED_STATUS_CHANGED, () => {
				this.rewrite(pos, `${name} ${this.constructor.status[seed.status]}`);
			})
		};

		runnable(this.runner);
		this.runner.seeds.forEach(seed);
		this.runner.MISuites.forEach(suite => {
			runnable(suite);
			suite.seeds.forEach(seed)
		})
	}

	/**
	 * @description
	 * Rewrites line in stdout, lines count from the beginning of runner execution
	 * @param {number} line - Line to rewrite
	 * @param {string} str - String
	 */
	rewrite(line, str) {
		if (!this.istty) return this.write(str);
		const delta = line - this.y;
		process.stdout.moveCursor(0, delta);
		process.stdout.clearLine();
		this.write(str);
		this.y--;
		process.stdout.moveCursor(0, - delta);
	};

	/**
	 *
	 * @param {string} str - Original string
	 * @param {Array.<string>} modifiers - Array of modifiers
	 * @returns {string} result - modifies string
	 */
	static modify(str, modifiers) {
		return [...modifiers.map(m => this.modifiers[m]), str, this.modifiers.normal].join('');
	}

	/**
	 * @description
	 * TTY formatting symbols
	 * @enum
	 * @static
	 * @type {object.<string, string>}
	 */
	static modifiers = {
		normal: `\x1b[0m`,
		bold: '\x1b[1m',
		dim: '\x1b[2m',
		red: '\x1b[0;31m',
		green: '\x1b[0;32m',
		yellow: '\x1b[0;33m',
		default: '\x1b[0;39m',
		blue: '\x1b[0;34m'
	};

	/**
	 * @description
	 * Mapped Suite/Seed status on colored string
	 * @enum
	 * @static
	 * @type {object.<number, string>}
	 */
	static status = {
		[Seed.status.NOT_STARTED]: this.modify('none', ['dim']),
		[Seed.status.IN_PROGRESS]: this.modify('wait', ['yellow']),
		[Seed.status.FAILED]: this.modify('fail', ['red']),
		[Seed.status.SUCCEEDED]: this.modify('done', ['green']),
	};

	/**
	 * @description
	 * Mapped Runner/Suite seeding mode on chars
	 * @enum
	 * @static
	 * @type {object.<number,string>}
	 */
	static mode = {
		[Suite.mode.ALLOW_TO_FAIL]: 'A',
		[Suite.mode.INTERRUPT_SUITE]:'S',
		[Suite.mode.INTERRUPT_RUN]: 'R'
	};

	/**
	 * @description
	 * Mapped Runner/Suite behaviour on chars
	 * @enum
	 * @static
	 * @type {object.<number, string>}
	 */
	static behaviour = {
		[Suite.behaviour.CONTINUE]: 'C',
		[Suite.behaviour.INTERRUPT]:'I',
	};
};


module.exports = Reporter;