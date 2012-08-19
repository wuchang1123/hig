var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath;
	server.get(/(.+\.(?:htm|html))$/, function (req, res, next) {
		var fullPath = serverpath + req.params[0], content;
		if (fullPath.indexOf('..') !== -1) {
			return next();
		}
		if (fileutils.isFile(fullPath)) {
			content = fs.readFileSync(fullPath, 'utf8');
			servers.send["html"](res, content || '');
		} else {
			return next();
		}
	});
}

servers.components.push({
	up: up
});