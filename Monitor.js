const Suite = require('./Suite.js');
const AsyncJob = require('./AsyncJob.js')
const Serializable = require('./Serializable.js');
const moment = require('moment');
function Monitor(suites) {
	Serializable.apply(this, ['async']);
	this.posY = 0;
	let y = 0;

	this.runner = MIRunner;
	this.logger = this.runner.logger;
	this.logger.registerModule(this);

	this.suites = [];

	const _this = this;
	const resolver = { resolve: () => {} };
	const promise = new Promise((rs, rj) => resolver.resolve = rs);

	const CLFallback = console.log;
	const CLStab = (...args) => {
		CLFallback.apply(console, args);
	}

	console.log = function(...args) {
		_this.posY++;
		CLStab(...args);
	}


	this.writeWithRestore = function(delta, str) {
		process.stdout.moveCursor(0, delta);
		process.stdout.clearLine();
		process.stdout.write(Buffer.from(`${str}\n`)); //?
		process.stdout.moveCursor(0, - delta - 1);
	}

	this.destroy = function() { return promise };

	const done = function() {
		if(suites.every(suite => suite.status.async !== undefined)) {
			console.log = CLFallback;
			resolver.resolve();
		}
	}
	

	if (suites.length === 0);
		done();
	suites.forEach(suite => {
		//Logger
		const suiteObj = { 
			suite: suite,
			jobs: []
		};
		this.suites.push(suiteObj);
		const sign = `${Monitor.suiteModeSign[suite.asyncErrorMode]}${Monitor.suiteBehaviourSign[suite.asyncErrorBehaviour]}`;
		//Position in output
		process.stdout.write(Buffer.from(`${suite.name.padEnd(45)} .... ${sign}\n`));
		const aY = y;
		//Store every job and event to off events after display
		const jobsStateHandlers = [];
		//Turn off event after first handle (if suite is ready, no task will be updated anymore)
		function suiteStateHandler() {
			const delta = - (_this.posY - aY);
			const status = Monitor.status[AsyncJob.status[(suite.status.async ? "FINISHED" : "FAILED")]];
			_this.writeWithRestore(delta, `${suite.name.padEnd(45)} ${status} ${sign}`);
			//Off itself
			suite.off("asyncReady asyncFail", suiteStateHandler);
			//Off all of jobs events
			for (h of jobsStateHandlers)
				h.job.off("statusChange", h.handler);
			done();	
		}
		suite.on("asyncReady asyncFail", suiteStateHandler);
		y++;
		suite.getAsyncs().forEach(a => {
			process.stdout.write(Buffer.from(`    ${a.name.padEnd(41)} ${Monitor.status[a.status]}\n`)); //?
			const jobObj = {
				job: a,
				timeline: []
			};
			suiteObj.jobs.push(jobObj);
			const aY = y;
			const jobStateHandler = (status) => {
				const delta = - (_this.posY - aY);
				jobObj.timeline.push({ status: status, timestamp: moment().valueOf() });
				_this.writeWithRestore(delta, `    ${a.name.padEnd(41)} ${Monitor.status[status]}`)
			}
			a.on("statusChange", jobStateHandler);
			//Don't forget to store event
			jobsStateHandlers.push({job: a, handler: jobStateHandler});
			y++;	
		})
	})
	this.posY = y;
}

Monitor.prototype = Object.create(Serializable.prototype);
Monitor.prototype.constructor = Monitor;

Monitor.prototype.serialize = function serialize() {
	return {
		states: AsyncJob.status,
		suites: this.suites.map(s => ({ 
			suite: s.suite.name,
			jobs: s.jobs.map(j => ({
				job: j.job.name,
				timeline: j.timeline
			}))
		}))
	}
}

Monitor.status = {
	[AsyncJob.status.NOT_STARTED]: '\033[2mnone\033[0m',
	[AsyncJob.status.IN_PROGRESS]: '\033[0;33mwait\033[0m',
	[AsyncJob.status.FAILED]: '\033[0;31mfail\033[0m',
	[AsyncJob.status.FINISHED]: '\033[0;32mdone\033[0m',	
}
Monitor.suiteModeSign = {
	[Suite.asyncErrorMode.ALLOW_TO_FAIL]: 'A',
	[Suite.asyncErrorMode.INTERRUPT_SUITE]:'S',
	[Suite.asyncErrorMode.INTERRUPT_RUN]: 'R'	
}
Monitor.suiteBehaviourSign = {
	[Suite.asyncErrorBehaviour.CONTINUE]: 'C',
	[Suite.asyncErrorBehaviour.INTERRUPT]:'I',
}

module.exports = Monitor;
