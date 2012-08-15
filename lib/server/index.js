var express	= require('express'),
	compilers  = require('../compilers'),
	server = express(),
	components = [];

module.exports = {
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
		}
	},
	listen: function(options) {
		options.partials && (compilers.hdbPartialPath = options.serverpath + options.partials + "/"); 
		components.forEach(function(component, index) {
			component && component.up && component.up(options);
		});
		server.listen(options.port);
		return console.log('Started server on: ' + options.port);
	}
};
// 注意顺序，需要优先的排前
require("./jspackages");
require("./csspackages");
require("./js");
require("./styl");
require("./less");
require("./css");
require("./hdb");
require("./images");
require("./views");


/*
//ops['public'] && server.use(express.static(serverpath + "/" + ops['public']));
server.listen(ops.port);
return console.log('Started server on: ' + ops.port);
*/