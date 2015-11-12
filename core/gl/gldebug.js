// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Parts copyright 2012 Google, Inc. All Rights Reserved. (APACHE 2.0 license)
define.class('$gl/glshader', function(require, exports, self){
	this.matrix = mat4()

	this.position = function(){
		return mesh.pos * matrix
	}
	
	this.color = function(){
		if(mesh.debug == 0.) return 'red'
		if(mesh.debug == 1.) return 'green'
		if(mesh.debug == 2.) return 'blue'
		return 'white'
	}

	this.debuggeom = define.struct({
		pos:vec2,
		debug:float
	}).extend(function(){

		this.add = function(x, y, w, h, dbg){
			this.pushQuad(
				x, y, dbg, 
				x + w, y, dbg,
				x, y + h, dbg,
				x + w, y + h, dbg
			)
		}
	})

	this.mesh = this.debuggeom.array()
})