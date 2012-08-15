var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath,
		ops = options,
		name = "hdb",
		reg = new RegExp('^((?:\\/[\\w\\d\\_\\-]+[\\w\\_\\-\\.\\/]*)+\\.' + name + ')$');
	
	server.get(reg, function (req, res, next) {
		var fullPath = serverpath + req.params[0],
			bulider, jsonPath, json;
		if (!fileutils.isFile(fullPath)) {
			fullPath = fullPath.replace(/(\/[^\/]+)$/, function($0, $1) {
				return '/' + name + $0;
			});
		}
		if (fullPath.indexOf('..') !== -1) {
			return next();
		}
		if (fileutils.isFile(fullPath)) {
			delete require.cache[fullPath];
			bulider = require(fullPath);
			
			jsonPath = fullPath.replace(/\.hdb$/, ".json");
			if (fileutils.isFile(jsonPath)) {
				json = fs.readFileSync(jsonPath, 'utf8');
				json = JSON.parse(json);
			}
			
			servers.send["html"](res, bulider(json) || '');
		} else {
			return next();
		}
	});
}

servers.components.push({
	up: up
});