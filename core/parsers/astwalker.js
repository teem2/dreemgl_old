// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, exports, self){

	self.atConstructor = function(defs){
		this.defs = defs
	}

	self.walk = function(node, parent, defs){
		if(this[node.type] && this[node.type](node, parent)) return true
		var lut = this.defs[node.type]
		if(!lut) console.log('Cannot find', node.type, node)
		for(var item in lut){
			var type = lut[item]
			if(type == 3){ // object
				var array  = node[item]
				if(array) for(var i =0 ; i < array.length; i++){
					var item = array[i]
					if(this.walk(item.key, node)) return true
					if(this.walk(item.value, node)) return true
				}
			}
			else if(type == 2){//array
				var array  = node[item]
				if(array) for(var i = 0; i<array.length; i++) {
					if(this.walk(array[i], node)) return true
				}
			}
			else if(type == 1){ // object
				if(node[item] && this.walk(node[item], node)) return true
			}
		}
	}
})
