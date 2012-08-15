#!/usr/bin/env node
var express    = require('express'),
	argv       = require('optimist').argv,
	resolve    = require('path').resolve,
	fileutils  = require('./lib/fileutils'),
	compilers  = require('./lib/compilers');

var path = resolve(argv._[0] || process.cwd());
var port = argv.p || argv.port || process.env.PORT || 9294;

server = express.createServer();
server.get(/^(\/assets\/(?:[\w\_\-\.\/]+\/){0,1})([\w\-\_]+)(\.(?:css|styl)){0,1}$/, function (req, res, next) {
	var filePath = req.params[0],
		fileName = req.params[1],
		fileType = req.params[2],
		fullPath,
		css = '';
	(!fileType || fileType == '.css') && (fileType = '.styl');
	fullPath = path + filePath + fileName + fileType
	if (filePath.indexOf('..') !== -1) {
		return next();
	}
	if (fileutils.isFile(fullPath)) {
		delete require.cache[fullPath];
		css = require(fullPath) || '';
	}
	res.header('Content-Type: text/css;charset=utf-8');
	res.send(css);
});
server.listen(port);

console.log('Started server on: ' + port);