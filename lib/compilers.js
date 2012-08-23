var fs = require('fs'),
	dirname = require('path').dirname,
	less = require('less'),
	stylus = require('stylus'),
	handlebars = require('handlebars'),
	fileutils  = require('./fileutils'),
	compilers = {}, lessParser;

compilers.styl = function(path) {
	var content, result = '';
	content = fs.readFileSync(path, 'utf8');
	stylus(content).include(dirname(path)).render(function(err, css) {
		if (err) {
			throw err;
		}
		return result = css;
	});
	return result;
};

require.extensions['.styl'] = function(module, filename) {
	var source;
	source = JSON.stringify(compilers.styl(filename));
	return module._compile("module.exports = " + source, filename);
};

compilers.less = function(path) {
	var ee, parseFn,
		content = fs.readFileSync(path, 'utf8');
	lessParser = lessParser || new(less.Parser)({
		paths: [ dirname(path) ]
	});
	parseFn = function(callback, compress) {
		lessParser.parse(content, function (err, tree) {
			var css = !err && tree.toCSS({
				compress: compress || false
			});
			callback(err && JSON.stringify(err), css && css.replace(/\/\*[\s\r\n\{]*(extend|replace)\s*:\s*1\;[\s\r\n\}]*\*\//g, ""), path);
		});
	}
	return parseFn;
};

require.extensions['.less'] = function(module, filename) {
	var source,
		ee = compilers.less(filename);
	module.exports = ee;
	return module;
};

compilers.hdb = function(path) {
	var content, template,
		dirPath = compilers.hdbPartialPath || path.replace(/[^\/]+$/, "");
	content = fs.readFileSync(path, 'utf8');
	template = handlebars.compile(content);
	content && content.replace(/\{\{>\s+([^\}]+)\}\}/g, function($0, $1) {
		var name = $1.replace(/\./, "/"),
			parPath = dirPath + name + ".hdb",
			partial = "\nPartial 404: " + name + " Not Found";
		if (fileutils.isFile(parPath)) {
			partial = fs.readFileSync(parPath, 'utf8');
		}
		handlebars.registerPartial(name, partial);
	});
	return template;
};

compilers.hdbPartialPath = "";

require.extensions['.hdb'] = function(module, filename) {
	var template = compilers.hdb(filename);
	module.exports = template;
	return module;
};
/*
var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " + 
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>{{> per.son}}";
var template = handlebars.compile(source);
handlebars.registerPartial("per.son", handlebars.compile("ssdsd {{name}} s")); 

var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
var result = template(data);
console.log(result);
*/
module.exports = compilers;