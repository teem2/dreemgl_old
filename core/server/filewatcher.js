// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Watch file changes

define.class(function(require, exports, self){

	var fs = require('fs')
	var promisify = require('$async/promisify')
	fs.statPromise = promisify(fs.stat)

	var uid = 0
	this.__trace__  = 2
	self.atConstructor = function(){
		this.files = {}
		this.timeout = 100
		this.poll = this.poll.bind(this)
		this.itv = setTimeout(this.poll, 0)
		this.lastfire = 0
		this.firelimit = 1000
		this.uid = uid++
	}

	self.atChange = function(changed_file){}

	self.poll = function(file){
		var stats = []
		var names = []
		for(var k in this.files){
			names.push(k)
			stats.push(fs.statPromise(define.expandVariables(k)))
		}
		Promise.all(stats).then(function(results){
			setTimeout(this.poll, this.timeout)
			for(var i = 0;i < results.length; i++){
				var file = names[i]
				var res = results[i]
				res.atime = null
				var str = JSON.stringify(res)
				// lets make sure we dont fire too often
				if(this.files[file] !== null && this.files[file] !== str){

					var now = Date.now()
					if(now - this.lastfire > this.firelimit){
						this.lastfire = now
						try{
							this.atChange(file)
						}
						catch(e){
							//console.log('WATCH EXCEPTION', e, e.stack)
							throw e
						}
					}
				}
				this.files[file] = str
			}
		}.bind(this)).catch(function(err){
			// TODO lets unwatch the files that errored?
			console.log("WATCH ERROR", err.stack)
		})
	}

	self.watch = function(file /*String:path of file to watch*/){
		if(!(file in this.files)) this.files[file] = null
	}
})