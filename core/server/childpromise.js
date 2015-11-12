// Licensed under the Apache License, Version 2.0, see LICENSE.md
// childPromise turns a childprocess into a promise that resolves with the output of the process

define(function(require){
	var child_process = require('child_process')

	return function childPromise(execpath, args){
		return new Promise(function(resolve, reject){

			var child = child_process.spawn(execpath, args)

			var result = {stdout:'', stderr:'', code:0}
			child.stdout.on('data', function(buf){
				result.stdout += buf.toString()
			})

			child.stderr.on('data', function(buf){
				result.stderr += buf.toString()
			})

			child.on('close', function(code){
				result.code = 0
				resolve(result)
			})

			child.on('error', function(error){
				reject(error)
			})
		})
	}
})