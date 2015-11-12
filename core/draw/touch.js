// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(node){
	this.atConstructor = function(){}
	
	this.events = ['start', 'end', 'cancel', 'leave', 'move']
	this.attributes = {
		x: {type:int},
		y: {type:int},
		x1: {type:int},
		y1: {type:int},
		x2: {type:int},
		y2: {type:int},
		x3: {type:int},
		y3: {type:int},
		x4: {type:int},
		y4: {type:int},
		fingers: {type:int}
	}
})