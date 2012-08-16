var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	util = require('../util'),
	fs = require('fs'),
	modelsPath, layoutsPath, defaultLayoutPath;

function up(options) {
	var serverpath = options.serverpath,
		ops = options,
		name = "hdb",
		reg = new RegExp('^\\/((?:[\\w\\d\\_\\-]+[\\w\\_\\-\\.\\/]*)+)(\\.' + name + ')$');
	
	modelsPath = serverpath + (ops ? (ops.models || "") : "");
	layoutsPath = serverpath + (ops ? (ops.layouts || "") : "");
	defaultLayoutPath = [layoutsPath, "common"].join("/") + ".hdb";
	
	server.get(reg, function (req, res, next) {
		var dirPath = req.params[0].replace(/\/hdb(\/[^\/]+)/, "$1"),
			fullPath = [serverpath, "views", dirPath].join("/") + ".hdb",
			modelPath = [modelsPath, dirPath].join("/") + ".json",
			layoutPath = [layoutsPath, dirPath].join("/") + ".hdb",
			json, templete, layoutTemplete, content;
		if (!fileutils.isFile(fullPath)) {
			fullPath = fullPath.replace(/(\/[^\/]+)$/, function($0, $1) {
				return '/' + name + $0;
			});
		}
		if (!fileutils.isFile(layoutPath)) {
			layoutPath = defaultLayoutPath;
		}
		if (fileutils.isFile(layoutPath)) {
			delete require.cache[layoutPath];
			layoutTemplete = require(layoutPath);
		}
		if (fullPath.indexOf('..') !== -1) {
			return next();
		}
		if (fileutils.isFile(fullPath)) {
			if (fileutils.isFile(modelPath)) {
				json = fs.readFileSync(modelPath, 'utf8');
				json = JSON.parse(json);
			}
			delete require.cache[fullPath];
			templete = require(fullPath);
			content = templete(json);
			if (layoutTemplete) {
				content = layoutTemplete(util.merge(json, {layoutContent: content}));
			}
			servers.send["html"](res, content || '');
		} else {
			return next();
		}
	});
}

servers.components.push({
	up: up
});