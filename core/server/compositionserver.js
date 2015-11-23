/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
// parse a color string into a [r,g,b] 0-1 float array

define.class(function(require){

	var path = require('path')
	var fs = require('fs')

	var ExternalApps = require('$server/externalapps')
	var BusServer = require('$rpc/busserver')
	var FileWatcher = require('$server/filewatcher')
	var HTMLParser = require('$parse/htmlparser')
	var ScriptError = require('$parse/scripterror')
	var legacy_support = 0

	this.atConstructor = function(
		args, //Object: Process arguments
		name, //String: name of the composition
		teemserver){ //TeemServer: teem server object

		this.teemserver = teemserver
	 	this.args = args
		this.name = name

		this.busserver = new BusServer()

		this.watcher = new FileWatcher()

		// lets give it a session
		this.session = Math.random() * 1000000

		this.watcher.atChange = function(){
			// lets reload this app
			this.reload()
		}.bind(this)

		this.components = {}
		// lets compile and run the dreem composition
		define.atRequire = function(filename){
			// ignore build output
			if(filename.indexOf(define.expandVariables('$build')) == 0){
				return
			}
			// lets output to the main watcher
			// process.stderr.write('\x0F!'+filename+'\n', function(){})
			this.watcher.watch(filename)
		}.bind(this)
		//
		this.reload()
	}

	// Called when any of the dependent files change for this composition
	this.atChange = function(){
	}

	// Destroys all objects maintained by the composition
	this.destroy = function(){
		if(this.myteem && this.myteem.destroy) this.myteem.destroy()
		this.myteem = undefined
	}

	this.readSystemClasses = function(basedir, out){
		var dir = fs.readdirSync(define.expandVariables(basedir))
		for(var i = 0; i < dir.length; i++){
			var subitem = basedir + '/' + dir[i]
			var stat = fs.statSync(define.expandVariables(subitem))
			if(stat.isDirectory()){
				this.readSystemClasses(subitem, out)
			}
			else{
				var clsname = dir[i].replace(/\.js$/, '')
				if(clsname in out){
					console.log("WARNING DUPLICATE CLASS: " + subitem + " ORIGINAL:" + out[clsname])
				}
				out[clsname] = subitem
			}
		}
	}

	this.reload = function(){
		console.color("~bg~Reloading~~ composition\n")
		this.destroy()

		this.readSystemClasses('$classes', this.system_classes = {})

		// lets fill 
		require.clearCache()

		// ok, we will need to compute the local classes thing
		define.system_classes = this.system_classes
		define.$drawmode = 'headless'
		// lets figure out if we are a direct .js file or a 
		// directory with an index.js 
		var scan = [
			{
				mapped:'$compositions/' + this.name + '/index.js',
				real:'$compositions/' + this.name + '/index.js'
			},
			{
				mapped:'/_external_/' + this.name + '/index.js',
				real:'$external/' + this.name + '/index.js'
			},
			{
				mapped:'$compositions/' + this.name + '.js',
				real:'$compositions/' + this.name + '.js'
			},
			{
				mapped:'/_external_/' + this.name + '.js',
				real:'$external/' + this.name + '.js'
			},
		]

		for(var i = 0; i < scan.length;i++){
			if(fs.existsSync(define.expandVariables(scan[i].real))){
				this.index_mapped = scan[i].mapped
				this.index_real = scan[i].real
				break
			}
		}

		// lets load up the teem nodejs part
		try{
			var Composition = require(this.index_real)
			this.composition = new Composition(this.busserver, this.session)
		}
		catch(e){
			console.log(e.stack)
		}
	}

	this.loadHTML = function(title, boot){
		return '<html lang="en">\n'+
			' <head>\n'+
			'  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n'+
			'  <meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">\n'+
			'  <meta name="apple-mobile-web-app-capable" content="yes">\n'+
			'  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'+	
			'  <meta name="format-detection" content="telephone=no">\n'+
			'  <title>' + title + '</title>\n'+
			'  <style>\n'+ 
			'    .unselectable{\n'+
			' 		-webkit-user-select: none;\n'+
  			'		-moz-user-select: none;\n'+
  			'		-user-select: none;\n'+
  			'    }\n'+
			'    body {background-color:darkgray;margin:0;padding:0;height:100%;overflow:hidden;}\n'+
			'  </style>'+
			'  <script type="text/javascript">\n'+
			'    window.define = {\n'+
			'	   $drawmode:"webgl",\n'+
			'      system_classes:' + JSON.stringify(this.system_classes) + ',\n' + 
			'      main:["$base/math", "' + boot + '"],\n'+
			'      atMain:function(require, modules){\n'+
			'        define.endLoader()\n'+
			'		 define.global(require(modules[0]))\n'+
			'		 var Composition = require(modules[1])\n'+
			'        define.rootComposition = new Composition(define.rootComposition)\n'+
			'      },\n'+
			'	   atEnd:function(){\n'+
			'         define.startLoader()\n'+
			'      }\n'+
			'    }\n'+
			'  </script>\n'+
			'  <script type="text/javascript" src="/define.js"></script>\n'+
			' </head>\n'+
			' <body class="unselectable">\n'+
			' </body>\n'+
			'</html>\n'
	}

	this.request = function(req, res){
		var base = req.url.split('?')[0]
		var app = base.split('/')[2] || 'browser'
		// ok lets serve our Composition device 

		if(req.method == 'POST'){
			// lets do an RPC call
			var buf = ''
			req.on('data', function(data){buf += data.toString()})
			req.on('end', function(){
				try{
					var json = JSON.parse(buf)
					this.composition.postAPI(json, {send:function(msg){
						res.writeHead(200, {"Content-Type":"text/json"})
						res.write(JSON.stringify(msg))
						res.end()
					}})
				}
				catch(e){
					res.writeHead(500, {"Content-Type": "text/html"})
					res.write('FAIL')
					res.end()
					return
				}
			}.bind(this))
			return
		}

		var header = {
			"Cache-control": "max-age=0",
			"Content-Type": "text/html"
		}
		//var screen = this.screens[app]

		// nodejs root
		if(req.headers['client-type'] === 'nodejs'){
			res.writeHead(200, {"Content-type":"text/json"})	
			res.write(JSON.stringify({title:this.name, boot:this.index_mapped, system_classes:this.system_classes }))
			res.end()
			return
		}

		var html = this.loadHTML(this.name, this.index_mapped)
		res.writeHead(200, header)
		res.write(html)
		res.end()
	}
})