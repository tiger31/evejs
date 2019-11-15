const Mocha = require('mocha');
const axios = require('axios');

function MochaFollower(runner) {
	this.logger = runner.logger;
	this.intercept();
}

MochaFollower.prototype.constructor = MochaFollower;

MochaFollower.prototype.intercept = function intercept() {
	const self = this;

	function resolved(response) {
		self.logger.all({ prefix: ["MOCHA", "INTERCEPT" ], message: `Intercepted response with code ${response.status}`});
		const collect = {
			request: {
				headers: response.config.headers,
				method: response.config.method,
				url: response.config.url,
				params: response.config.params,
				data: response.config.data,
				currentUrl: response.request._currentUrl 
			},
			response: {
				url: response.request.res.responseUrl,
				statusCode: response.request.res.statusCode,
				statusText: response.request.res.statusMessage,
				redirected: (response.request._redirectable && response.request._redirectable._isRedirect),
				data: response.data,
				headers: response.headers
			}
		}
		allure.createAttachment("Response", MochaFollower.response(collect), "text/plain");
		return response;
	}

	function rejected(error) {
		self.logger.all({ prefix: ["MOCHA", "INTERCEPT" ], message: `Intercepted response rejection with code ${error.status}`});
		const collect = {
			request: {
				headers: error.config.headers,
				method: error.config.method,
				url: error.config.url,
				params: error.config.params,
				data: error.config.data || "",
				currentUrl: error.request._currentUrl 
			}
		}
		if (error.response) {
			collect.response = {
				url: error.request.res.responseUrl,
				statusCode: error.request.res.statusCode,
				statusText: error.response.request.res.statusMessage,
				redirected: (error.request._redirectable && error.request._redirectable._isRedirected),
				data: error.response.data,
				headers: error.response.headers
			}
		}
		allure.createAttachment("Response", MochaFollower.response(collect), "text/plain");
		return Promise.reject(error);
	}

	const stab = axios.create;
	axios.create = function createStab(...args) {
		const inst = stab.apply(axios, args);
		inst.interceptors.response.use(resolved, rejected);
		return inst;
	}

	axios.interceptors.response.use(resolved, rejected)
}
MochaFollower.objToString = function(obj) {
	return (Object.keys(obj).map(k => `${k}: ${obj[k]}`).join('\r\n'));
}
MochaFollower.response = function(response) {
	const builder = [];
	//form head
	builder.push(`${response.request.method.toUpperCase()} ${response.request.url}\r\n`);
	//request headers
	builder.push('Request headers:');
	builder.push(MochaFollower.objToString(response.request.headers));
	if (response.request.params) {
		builder.push('\r\nRequest params');
		builder.push(MochaFollower.objToString(response.request.params));
	}
	if (response.request.data) {
		builder.push('\r\nRequest params');
		builder.push(MochaFollower.objToString(response.request.data));
	}
	//response 
	if (response.response) {
		builder.push(`\r\n${response.response.statusCode} ${response.response.statusText}`);
		if (response.response.redirected) {
			builder.push(`Redirected to: ${response.response.url}\r\n`)
		}
		builder.push('Request headers:');
		builder.push(MochaFollower.objToString(response.response.headers));
		builder.push('\r\nResponse data:');
		builder.push(JSON.stringify(response.response.data, null, 2));
	} else {
		builder.push('No response from server')
	}
	return builder.join('\r\n');
}

MochaFollower.prototype.tree = function tree(depth = 0, suite = this.logger.suites[0]) {
	const prefix = '  ';
	console.log(`${prefix.repeat(depth)}${(suite.root) ? "Root" : suite.suite.title}`);
	suite.tests.forEach(test => console.log(`${prefix.repeat(depth + 1)}[${test.state}] ${test.test.title}`))
	suite.suites.forEach(s => this.tree(depth + 1, s));
}

module.exports = MochaFollower;
