// Licensed under the Apache License, Version 2.0, see LICENSE.md

define(function(require, exports, module){
	module.exports = function dump(ast, defs, depth){
		if(!ast) return ''
		if (depth === undefined) depth = "";
		var out = ast.type + '\n'
		//for(var key in ast) out += depth + ' - ' + key
		var lut = defs[ast.type]
		if(!lut) console.log('Cannot find', ast.type, ast)
		for(var item in lut){
			var type = lut[item]
			if(type === 3){ // object
				var array  = ast[item]
				if(array) for(var i =0 ; i < array.length; i++){
					var item = array[i]
					out += depth + item.key.name + ':' + dump(item.value, defs, '')
				}
			}
			if(type === 2){//array
				var array  = ast[item]
				if(array) for(var i = 0; i<array.length; i++) {
					out += depth + item + ':' + dump(array[i], defs, depth + ' ')
				}				
			}
			else if(type === 1){ // object
				var obj = ast[item]
				if(obj !== undefined)
					out += depth + item + ':' + dump(obj, defs, depth + ' ')
			}
			else if(type === 0){
				var value = ast[item]
				if(value !== undefined)
					out += depth + item + ':' + ast[item]
			}
		}
		return out
	}	
})
