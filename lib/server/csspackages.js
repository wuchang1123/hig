var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	fs = require('fs');

function up(options) {
	var serverpath = options.serverpath,
		ops = options;
	ops['cssPackages']  && ops['cssPackages'].forEach(function(file, index) {
		if (!file.path) return;
		var paths = file.paths;
		server.get(file.path, function (req, res, next) {
			var css = [], fullPath, bulider, pLen = 0, cLen = 0;
			function send() {
				servers.send["css"](res, css.join("\n"));
			}
			paths.forEach(function(path, index) {
				fullPath = serverpath + path;
				if (!fileutils.isFile(fullPath)) {
					path.replace(/\.([^\.]+)$/, function($0, name) {
						var path = fullPath.replace(/(\/[^\/]+)$/, function($0, $1) {
							return '/' + name + $0;
						});
						if (fileutils.isFile(path)) {
							fullPath = path;
						}
					});
				}
				if (fileutils.isFile(fullPath)) {
					if (/\.css$/.test(fullPath)) {
						css.push(fs.readFileSync(fullPath, 'utf8'));
					} else {
						delete require.cache[fullPath];
						pLen++;
						if (/\.less$/.test(path)) {
							bulider = require(fullPath);
							bulider.on('success', function(msg) {
								cLen++;
								msg && css.push(msg);
								pLen === cLen && send();
							});
						} else {
							css.push(require(fullPath));
						}
					}
				}
			});
			if (!/\.less\|\|/.test(paths.join('||') + '||')) {
				send();
			}
		});
	});
}

servers.components.push({
	up: up
});