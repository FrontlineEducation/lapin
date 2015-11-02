'use strict';

var loggerNoEmitter = {
	'error' : function () {
	},

	'warn' : function () {
	},

	'info' : function () {
	},

	'verbose' : function () {
	},

	'debug' : function () {
	},

	'silly' : function () {
	}
};

module.exports = function () {
	return loggerNoEmitter;
};
