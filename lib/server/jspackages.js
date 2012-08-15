var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath,
		ops = options;
	ops['jsPackages']  && ops['jsPackages'].forEach(function(file, index) {
		if (!file.path) return;
		var paths = file.paths;
		server.get(file.path, function (req, res, next) {
			var js = [], fullPath;
			paths.forEach(function(path, index) {
				fullPath = serverpath + path;
				if (fileutils.isFile(fullPath)) {
					js.push(fs.readFileSync(fullPath, 'utf8'));
				}
			});
			servers.send["js"](res, js.join("\n"));
		});
	});
}

servers.components.push({
	up: up
});