var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath,
		ops = options;
	ops['cssFrames'] && ops['cssFrames'].forEach(function(name, index){
		var reg = new RegExp('^((?:\\/[\\w\\d\\_\\-]+[\\w\\_\\-\\.\\/]*)+\\.' + name + ')$');
		server.get(reg, function (req, res, next) {
			var fullPath = serverpath + req.params[0], bulider;
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
				function send(content) {
					res.set({'Content-Type': 'text/css;charset=utf-8'});
					res.send(content || '');
				}
				if (name !== 'less') {
					send(bulider);
				} else {
					bulider.on('success', function(msg) {
						send(msg);
					});
				}
			} else {
				return next();
			}
		});
	});
}

servers.components.push({
	up: up
});