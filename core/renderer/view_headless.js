// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Node worker baseclass

define.class('./view_base', function(require, exports, self){
	var node = require('$base/node')

	define.class(this, 'bg', function(node){})
	define.class(this, 'fg', function(node){})

	this.atConstructor = function(){
	}

	this.render = function(){
	}

	this.spawn = function(parent){
	}
})