// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Script error holds a file/line

define.class(function(require, exports, self){

	self.atConstructor = function(message, path, line, col){
		this.message = message
		if(arguments.length == 2){
			this.where = path
			return
		}
		this.path = path
		this.line = line
		this.col = col
	}

	self.expand = function(path, source){
		if(this.where !== undefined){
			var col = 0
			var line = 0
			for(var i = 0; i < source.length && i < this.where; i++, col++){
				if(source.charCodeAt(i) == 10) line++, col = 0
			}
			this.line = line + 1
			this.col = col + 1
			this.path = path
			this.where = undefined
		}
	}

	self.toString = function(){
		return 'Dreem Error: '+this.path+(this.line!==undefined?":"+this.line+(this.col?":"+this.col:""):"")+"- " + this.message 
	}
})