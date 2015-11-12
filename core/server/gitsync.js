// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Git synchronize your project automatically

define.class(function(require, exports, self){
	var childPromise = require('$server/childpromise')
	var async = require('$async/async')
	var promisify = require('$async/promisify')

	self.atConstructor = function(args){
		this.run()
	}

	self.run = async(function*(){
		
		var result = yield childPromise("git",["pull","origin"])
		// check result!
		if(result.stdout.indexOf('Already up-to-date') == 0)
		{
		}
		else{
			console.color("\n~bm~Synchronizing git repo:               ")
			console.log(result.stdout)
		}
		console.color(".")
		var result = yield childPromise("git",["status","--porcelain"])
		// ok lets split stdout in newlines
		var items = result.stdout.split('\n')
		var modified = false;
		
		for(var i = 0; i < items.length; i++){
			var item = items[i]
			var file = item.slice(3)
			if(item.indexOf('??') == 0){
				console.log(((modified==true)?"":"\n")+'A '+file)				
				yield childPromise("git",["add",file])
				modified = true
			}
			else if(item.indexOf(' D') == 0){
				console.log((modified?"":"\n")+'D '+file)
				yield childPromise("git",["rm",file])
				modified = true
			}
			else if(item.indexOf(' U') == 0 || item.indexOf(' M') == 0){
				console.log((modified?"":"\n")+'M '+file)
				yield childPromise("git",["add",file])	
				modified = true 
			}
		}
		if(modified){
			yield childPromise("git",["commit","-m","work"])
			console.color('~br~Pushing: ')
			var result = yield childPromise("git",["push","origin"])
			console.color("~bg~OK!\n")
		}
		else{
		//	console.color("~by~Nothing to do, waiting 5 seconds!\n")
			yield promisify.timeout(5000)
		}
	})
})