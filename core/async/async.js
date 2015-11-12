// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Async js

define(function(){
	// turn a generator into an async loop	
	function async(generator){
		var ret = function(){
			var iter = generator.apply(this, arguments)

			return new Promise(function(resolve, reject){
				function error(e){ reject(e) }
				function next(value){
					var iterval = iter.next(value)
					if(iterval.done === false) iterval.value.then(next, error)
					else resolve(iterval.value)
				}
				next()
			})
		}
		return ret
	}
	return async
})