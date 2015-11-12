// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, shape3d, text, view, icon){
	// The classic Utah teapot - rebuilt from the original bezier patch set.
	
	if(define.$environment === 'nodejs') return

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$gl/glgeom')
	var GLMat = require('$gl/glmaterial')

	this.attributes = {
		// Size of the teapot
		radius: {type:float, value:1},
		// Level of detail. 1 = cubic teapot, 10+ = very very smooth teapot.
		detail: {type:float, value:10}
	}
	
	this.radius = this.detail = function(){
		this.setDirty();
	}
	
	this.init = function(){
		this.bg_shader.addTeapot(this.radius, this.detail);
	}

})
