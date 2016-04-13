'use strict';

const loggerNoEmitter = {
	error () {
	},

	warn () {
	},

	info () {
	},

	verbose () {
	},

	debug () {
	},

	silly () {
	}
};

module.exports = function () {
	return loggerNoEmitter;
};
