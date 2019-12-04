const Seed = require('../Seed');
const Suite = require('../Suite');
const Test = require('../Test');
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
	 * @type {?string}
	 */
	state;

	/**
	 * @external Runner
	 * @param {Runner} runner - Runner
	 */
	constructor(runner) {
		this.runner = runner;
		this.istty = global.process.stdout.isTTY;
		if (this.istty)
			this.width = Math.min((global.process.stdout.getWindowSize) ? global.process.stdout.getWindowSize()[0] : tty.getWindowSize()[1], 64);
		this.runner.once(this.runner.constructor.events.EVENT_STATE_SEEDING_BEGIN, this.seeding);
		this.runner.once(this.runner.constructor.events.EVENT_STATE_INIT_BEGIN, this.init);
		this.runner.once(this.runner.constructor.events.EVENT_STATE_PREPARE_BEGIN, this.prepare);
		this.runner.once(this.runner.constructor.events.EVENT_STATE_FRAMEWORK_BEGIN, this.framework);
		this.runner.on(this.runner.constructor.events.EVENT_UNHANDLED_REJECTION, (error) => {
			this.log(`Caught unhandled rejection: ${(error instanceof Error) ? error.stack : error}`)
		})
	}

	/**
	 * @description
	 * Writes string in stdout, remembering positioning
	 * @param {string} str - String
	 */
	write(str) {
		let string;
		if (str instanceof Error) {
			string = `${str.stack}`;
		} else {
			string = str ? (str.toString()) : '';
		}
		global.process.stdout.write(`${global.Buffer.from(string)}\n`);
		this.y++;
	}

	/**
	 * @description
	 * Runs on seeding state to show seeds statuses
	 */
	seeding = () => {
		this.title('Seeding state');
		this.state = this.constructor.state.seeding;
		/**
		 * @external Suite
		 * @param {Suite} runnable - Runnable
		 */
		const runnable = (runnable) => {
			const max = this.width - 8;
			const pos = this.y;
			const name = this.constructor.modify(runnable.name.padEnd(max, ' '), [ 'bold' ]);
			const sign = `${this.constructor.mode[runnable.config.mode]}${this.constructor.behaviour[runnable.config.behaviour]}`;
			this.write(`${name} ${this.constructor.status[runnable.seeded]} ${sign}`);
			runnable.on(Suite.events.SEEDING_STATUS_CHANGED, () => {
				this.rewrite(pos, `${name} ${this.constructor.status[runnable.seeded]} ${sign}`);
			});
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
			});
		};

		runnable(this.runner);
		this.runner.seeds.forEach(seed);
		this.runner.MISuites.forEach((suite) => {
			runnable(suite);
			suite.seeds.forEach(seed);
		});

		this.runner.on(this.runner.constructor.events.EVENT_STATE_SEEDING_END, (seeds) => {
			for (const seed of seeds) {
				this.log(`${seed.suite.name} -> ${seed.name}`);
				this.write(seed.error);
			}
		});
	};

	/**
	 * @description
	 * Runs on init state to show runner initiation process
	 */
	init = () => {
		this.title('Initialization state');
		this.state = this.constructor.state.init;

		const handler = (file) => {
			this.log(`Require file "${file}"`);
		};

		this.runner.on(this.runner.constructor.events.EVENT_INIT_FILE_REQUIRE, handler);
		this.runner.once(this.runner.constructor.events.EVENT_STATE_INIT_END, () => {
			this.runner.off(this.runner.constructor.events.EVENT_INIT_FILE_REQUIRE, handler);
		});
	};

	/**
	 * @description
	 * Runs on prepare phase
	 */
	prepare = () => {
		this.title('Preparing state');
		this.state = this.constructor.state.prepare;
		this.log('Preparing tests tree...');
	};

	/**
	 * Runs on framework phase
	 */
	framework = () => {
		this.title('Framework state');
		this.state = this.constructor.state.framework;
		this.log('Giving control to tests framework');
		this.runner.once(this.runner.constructor.events.EVENT_FRAMEWORK_UNDETECTED_ENTITY, (undetected) => {
			const list = undetected.map((e) => {
				return `  ${e.entity.toString().padEnd(this.width - 12, '')}   ${this.constructor.result[e.state]}`;
			});
			this.log(`Found some undetected framework entities:\n${list}`);
		});
		this.runner.once(this.runner.constructor.events.EVENT_STATE_FRAMEWORK_END, (error) => {
			this.log('Retrieving control from framework');
			if (error)
				this.log('Framework finished with errors, kowalski analysis...');
		});
	};

	/**
	 * @description
	 * Prints message
	 * @param {string} message - Log message
	 * @param {string} [module="runner"] - Module
	 */
	log = (message, module = 'runner') => {
		const m = this.constructor.module[module];
		if (module !== 'runner') {
			this.write(`${m}: ${message}`);
		} else {
			this.write(`${m}${(this.state ? this.state : '')}: ${message}`);
		}
	};

	/**
	 * @description
	 * Writes title
	 * @param {string} [message=""] - Title
	 */
	title = (message = '') => {
		this.write(message.padStart(Math.floor((message.length + this.width) / 2), '-').padEnd(this.width, '-'));
	};

	/**
	 * @description
	 * Rewrites line in stdout, lines count from the beginning of runner execution
	 * @param {number} line - Line to rewrite
	 * @param {string} str - String
	 * @returns {void} If stdout isn't a tty returns from function and uses "write" method instead
	 */
	rewrite(line, str) {
		if (!this.istty) return this.write(str);
		const delta = line - this.y;
		global.process.stdout.moveCursor(0, delta);
		global.process.stdout.clearLine();
		this.write(str);
		this.y--;
		global.process.stdout.moveCursor(0, - delta);
	}

	/**
	 *
	 * @param {string} str - Original string
	 * @param {Array.<string>} modifiers - Array of modifiers
	 * @returns {string} result - modifies string
	 */
	static modify(str, modifiers) {
		return [ ...modifiers.map(m => this.modifiers[m]), str, this.modifiers.normal ].join('');
	}

	/**
	 * @description
	 * TTY formatting symbols
	 * @enum
	 * @static
	 * @type {object.<string, string>}
	 */
	static modifiers = {
		normal: '\x1b[0m',
		bold: '\x1b[1m',
		dim: '\x1b[2m',
		red: '\x1b[0;31m',
		green: '\x1b[0;32m',
		yellow: '\x1b[0;33m',
		default: '\x1b[0;39m',
		blue: '\x1b[0;34m',
		cyan: '\x1b[0;36m'
	};

	/**
	 * @description
	 * Mapped Suite/Seed status on colored string
	 * @enum
	 * @static
	 * @type {object.<number, string>}
	 */
	static status = {
		[Seed.status.NOT_STARTED]: this.modify('none', [ 'dim' ]),
		[Seed.status.IN_PROGRESS]: this.modify('wait', [ 'yellow' ]),
		[Seed.status.FAILED]: this.modify('fail', [ 'red' ]),
		[Seed.status.SUCCEEDED]: this.modify('done', [ 'green' ]),
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

	static state = {
		init: `[${this.modify('INIT', [ 'blue' ])}]`,
		seeding: `[${this.modify('SEEDING', [ 'green' ])}]`,
		prepare: `[${this.modify('PREPARE', [ 'yellow' ])}]`,
		framework: `[${this.modify('FRAMEWORK', [ 'cyan' ])}]`,
		emerge: `[${this.modify('EMERGE', [ 'dim' ])}]`,
		error: `[${this.modify('ERROR', [ 'red' ])}]`,
	};

	static module = {
		runner: `[${this.modify('Runner', [ 'bold' ])}]`,
	};

	static result = {
		[Test.states.PASSED]: this.modify(' passed', [ 'green' ]),
		[Test.states.FAILED]: this.modify(' failed', [ 'red' ]),
		[Test.states.PENDING]: this.modify('pending', [ 'blue' ]),
	};

};


module.exports = Reporter;