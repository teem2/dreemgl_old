// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, shape3d, text, view, icon){
	if(define.$environment === 'nodejs') return

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$gl/glgeom')
	var GLMat = require('$gl/glmaterial')

	this.attributes = {model:{type:undefined}}
	
	this.model = function(data){
		if(this.bg_shader)
		{
			this.bg_shader.addModel(data, function(){ this.setDirty()}.bind(this));
		}
		
	}
	
	this.init = function(){
		this.bg_shader.addModel(this.model, function(){ this.setDirty()}.bind(this));
		//console.log("init" ,this.model);
	}

	this.mouseover  = function(){
		console.log("mouse over geometry!", this.interfaceguid);
		this.bg_shader.diffusecolor = vec4("#ff0000");
		this.setDirty();
	}
	
	this.mouseout = function(){
		console.log("mouse out geometry!", this.interfaceguid);
		this.bg_shader.diffusecolor = vec4("#ffffff");
		this.setDirty();
	}
})
