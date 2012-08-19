var express	= require('express'),
	compilers  = require('../compilers'),
	fileutils  = require('../fileutils'),
	path = require('path'),
	resolve	= path.resolve,
	fs = require('fs'),
	server = express(),
	components = [];

var serverCore = {
	core: server,
	components: components,
	send: {
		html: function(res, content) {
			res.set({'Content-Type': 'text/html;charset=utf-8'});
			res.send(content);
		},
		js: function(res, content) {
			res.set({'Content-Type': 'text/javascript;charset=utf-8'});
			res.send(content);
		},
		css: function(res, content) {
			res.set({'Content-Type': 'text/css;charset=utf-8'});
			res.send(content);
		},
		htc: function(res, content) {
			res.set({'Content-Type': 'text/x-component;charset=utf-8'});
			res.send(content);
		}
	},
	listen: function(options) {
		options.partials && (compilers.hdbPartialPath = options.serverpath + options.partials + "/"); 
		components.forEach(function(component, index) {
			component && component.up && component.up(options);
		});
		server.get(/(.*PIE\.htc)$/, function (req, res, next) {
			var htcPath = resolve("../assets/htc/PIE.htc"), content;
			if (fileutils.isFile(htcPath)) {
				content = fs.readFileSync(htcPath, 'utf8');
			}
			console.log(htcPath);
			serverCore.send["htc"](res, content || "");
		});
		server.get(/(.*)/, function (req, res, next) {
			console.log(req.params[0] + " 404");
			serverCore.send["html"](res, "404 页面不存在");
		});
		server.listen(options.port);
		return console.log('Started server on: ' + options.port);
	}
};
module.exports = serverCore;
// 注意顺序，需要优先的排前
require("./jspackages");
require("./csspackages");
require("./js");
require("./styl");
require("./less");
require("./css");
require("./hdb");
require("./html");
require("./files");
require("./fonts");
require("./views");


/*
//ops['public'] && server.use(express.static(serverpath + "/" + ops['public']));
server.listen(ops.port);
return console.log('Started server on: ' + ops.port);
*/