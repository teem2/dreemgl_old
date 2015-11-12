// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, shape3d, text, view, icon){
	if(define.$environment === 'nodejs') return

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$gl/glgeom')
	var GLMat = require('$gl/glmaterial')
	
	this.attributes = {
		dimension: {type:vec2, value:vec3(1)},
		xdiv:{type:int, value:10},
		ydiv:{type:int, value:10}
	}

	this.init = function(){
		this.bg_shader.addPlane(this.dimension[0], this.dimension[1], this.xdiv, this.ydiv);
	}
})
