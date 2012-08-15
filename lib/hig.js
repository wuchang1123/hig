var HiG,
	optimist   = require('optimist'),
	argv	   = optimist.usage(['  usage: hig COMMAND', '	server  start a dynamic development server', '	build   serialize application to disk', '	watch   build & watch disk for changes'].join("\n")).alias('p', 'port').alias('d', 'debug').argv,
	path = require('path'),
	resolve	= path.resolve,
	fs = require('fs'),
	fileutils  = require('./fileutils'),

	help = function() {
		optimist.showHelp();
		return process.exit();
	};

var serverpath = resolve(process.cwd());
//console.log(process.cwd(), argv._[0], serverpath);
HiG = (function() {

	function HiG(options) {
		var key, value, _ref;
		if (options == null) {
			options = {};
		}
		for (key in options) {
			this.options[key] = options[key];
		}
		_ref = this.readConfig();
		for (key in _ref) {
			this.options[key] = _ref[key];
		}
		//console.log(this.options);
	}
	HiG.prototype.options = {
		"config": "./config.json",
		"port": argv.p || argv.port || process.env.PORT || 1632,
		"public": "/public",
		"models": "/models",
		"views": "/views",
		"partials": "",
		"cssPackages": [],
		"jsPackages": []
	};
	HiG.prototype.readConfig = function(config) {
		config = config || this.options.config;
		if (!(config && fs.existsSync(config))) {
			return {};
		}
		return JSON.parse(fs.readFileSync(config, 'utf-8'));
	};
	
	HiG.exec = function(command, options) {
		return (new this(options)).exec(command);
	};
	
	//HiG.prototype.compilers = compilers;

	HiG.prototype.server = function() {
		var ops = this.options,
			servers = require('./server');
		ops.serverpath = serverpath;
		return servers.listen(ops);
	}
	
	HiG.prototype.build = function() {
	}
	
	HiG.prototype.exec = function(command) {
		if (command == null) {
			command = argv._[0];
		}
		if (!this[command]) {
			return help();
		}
		this[command]();
	}
	
	return HiG;
})();

module.exports = HiG;