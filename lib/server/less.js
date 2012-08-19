var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath,
		ops = options,
		name = "less",
		reg = new RegExp('^((?:\\/[\\w\\d\\_\\-]+[\\w\\_\\-\\.\\/]*)+\\.' + name + ')$');
	
	server.get(reg, function (req, res, next) {
		var fullPath = serverpath + req.params[0], parse;
		if (!fileutils.isFile(fullPath)) {
			fullPath = fullPath.replace(/(\/[^\/]+)$/, function($0, $1) {
				return '/' + name + $0;
			});
		}
		if (fullPath.indexOf('..') !== -1) {
			return next();
		}
		if (fileutils.isFile(fullPath)) {
			fullPath = require.resolve(fullPath);
			delete require.cache[fullPath];
			parse = require(fullPath);
			parse(function(err, msg){
				servers.send["css"](res, msg || err || '');
			});
		} else {
			return next();
		}
	});
}

servers.components.push({
	up: up
});