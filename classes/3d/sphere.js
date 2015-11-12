// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, shape3d){
	if(define.$environment === 'nodejs') return

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$gl/glgeom')
	var GLMat = require('$gl/glmaterial')
	
	this.attribute("radius", {type:float, value:1});
	this.attribute("xdiv", {type:int, value:40});
	this.attribute("ydiv", {type:int, value:40});

	this.init = function(){
		this.bg_shader.addSphere(this.radius, this.xdiv, this.ydiv);
	}
})
