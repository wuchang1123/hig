var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	util = require('../util'),
	fs = require('fs'),
	serverpath, viewsPath, modelsPath;

function buildPage(component, pageName, req, res, next) {
	var fullPath, model = {}, modelPath = [], pathArr = [];
	
	if (component) {
		pathArr.push(component);
		if (!pageName) {
			fullPath = [viewsPath, pageName].join("/") + ".hdb";
			if (!fileutils.isFile(fullPath)) {
				pathArr.push("index");
			}
		} else {
			pathArr.push(pageName);
		}
	} else {
		if (pageName) {
			fullPath = [viewsPath, pageName].join("/") + ".hdb";
			if (!fileutils.isFile(fullPath)) {
				pathArr.push(pageName);
				pathArr.push("index");
			} else {
				pathArr.push(pageName);
			}
		} else {
			pathArr.push("index");
		}
	}
	fullPath = [viewsPath].concat(pathArr).join("/") + ".hdb";
	modelPath.push( [modelsPath, pathArr[0]].join("/") + ".json" );
	pathArr.length > 1 && modelPath.push( [modelsPath].concat(pathArr).join("/") + ".json" );
	
	if (fullPath.indexOf('..') !== -1) {
		return next();
	}
	buildRouter(fullPath, modelPath, req, res, next);
}

function buildRouter(pagePath, modelPath, req, res, next) {
	var model = {};
	if (fileutils.isFile(pagePath)) {
		modelPath.forEach(function(path, index) {
			if (fileutils.isFile(path)) {
				model = util.merge(model, JSON.parse(fs.readFileSync(path, 'utf-8') || ""));
			}
		});
		delete require.cache[pagePath];
		templete = require(pagePath);
		servers.send["html"](res, templete(model) || '');
	} else {
		return next();
	}
}

function buildPath(path, req) {
	return serverpath + path.replace(/\{\{([^\}]+)\}\}/g, function($0, $1) {
		return req.params[$1] || $0;
	});
}

function up(options) {
	var ops = options;
	
	serverpath = ops.serverpath;
	viewsPath = serverpath + (ops ? (ops.views || "") : "");
	modelsPath = serverpath + (ops ? (ops.models || "") : "");
	
	ops.routers.forEach(function(router, index) {
		var file = router && router.file,
			model = router && router.model;
		server.get(router.match, function (req, res, next) {
			var tmpfile = buildPath(file, req),
				tmpmodel = [];
			model.forEach(function(path, index) {
				tmpmodel.push(buildPath(path, req));
			});
			buildRouter(tmpfile, tmpmodel, req, res, next);
		});
	});
	
	server.get("/:component?", function (req, res, next) {
		var component = req.params.component;
		if (component && component.indexOf(".") > 0) {
			return next();
		}
		buildPage(component, null, req, res, next);
	});
	server.get(/.*/, function (req, res, next) {
		servers.send["html"](res, "404 页面不存在");
	});
}

servers.components.push({
	up: up
});