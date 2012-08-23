var servers = require("./index"),
	server = servers.core,
	fileutils  = require('../fileutils'),
	util = require('../util'),
	fs = require('fs'),
	serverpath, viewsPath, modelsPath, layoutsPath, defaultLayoutPath;

function buildPage(component, pageName, req, res, next) {
	var fullPath, model = {}, modelPath = [], pathArr = [],
		layoutPath;
	
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
	modelPath.push( [modelsPath, "common.json"].join("/") );
	modelPath.push( [modelsPath, pathArr[0]].join("/") + ".json" );
	if (pathArr.length > 1) {
		modelPath.push( [modelsPath].concat(pathArr).join("/") + ".json" );
		layoutPath = [layoutsPath].concat(pathArr).join("/") + ".hdb";
	}
	if (layoutPath && !fileutils.isFile(layoutPath)) {
		layoutPath = [layoutsPath, pathArr[0]].join("/") + ".hdb";
		if (!fileutils.isFile(layoutPath)) {
			layoutPath = null;
		}
	}
	
	if (fullPath.indexOf('..') !== -1) {
		return next();
	}
	buildRouter(fullPath, modelPath, layoutPath, req, res, next);
}

function buildRouter(pagePath, modelPath, layoutPath, req, res, next) {
	var model = {}, layoutTemplete = "", content;
	layoutPath = layoutPath || defaultLayoutPath;
	if (fileutils.isFile(layoutPath)) {
		delete require.cache[layoutPath];
		layoutTemplete = require(layoutPath);
	}
	if (fileutils.isFile(pagePath)) {
		modelPath.forEach(function(path, index) {
			if (fileutils.isFile(path)) {
				model = util.merge(model, JSON.parse(fs.readFileSync(path, 'utf-8') || ""));
			}
		});
		delete require.cache[pagePath];
		templete = require(pagePath);
		content = templete(model);
		if (layoutTemplete) {
			content = layoutTemplete(util.merge(model, {layoutContent: content}));
		}
		servers.send["html"](res, content || '');
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
	layoutsPath = serverpath + (ops ? (ops.layouts || "") : "");
	defaultLayoutPath = [layoutsPath, "common"].join("/") + ".hdb";
	
	ops.routers && ops.routers.forEach(function(router, index) {
		var file = router && router.file,
			model = router && router.model;
		server.get(router.match, function (req, res, next) {
			var tmpfile = buildPath(file, req),
				tmpmodel = [];
			model.forEach(function(path, index) {
				tmpmodel.push(buildPath(path, req));
			});
			buildRouter(tmpfile, tmpmodel, null, req, res, next);
		});
	});
	
	server.get("/:component?", function (req, res, next) {
		var component = req.params.component;
		if (component && component.indexOf(".") > 0) {
			return next();
		}
		buildPage(component, null, req, res, next);
	});
	
	server.get("/:component/:page", function (req, res, next) {
		var component = req.params.component,
			page = req.params.page;
		if ((page && page.indexOf(".") > 0)) {
			return next();
		}
		buildPage(component, page, req, res, next);
	});
}

servers.components.push({
	up: up
});