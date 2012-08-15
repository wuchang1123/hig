var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath;
	server.get(/(.+\.js)$/, function (req, res, next) {
		var fullPath = serverpath + req.params[0];
		if (fullPath.indexOf('..') !== -1) {
			return next();
		}
		if (fileutils.isFile(fullPath)) {
			var js = fs.readFileSync(fullPath, 'utf8');
			servers.send["js"](res, js);
		} else {
			return next();
		}
	});
}

servers.components.push({
	up: up
});