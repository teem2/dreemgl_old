/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(require, shape3d, text, view, icon){
	if(define.$environment === 'nodejs') return

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$gl/glgeom')
	var GLMat = require('$gl/glmaterial')

	
	this.attribute("dimension", {type:vec3, value:vec3(1)});

	
	this.init = function(){
		this.bg_shader.addBox(this.dimension[0], this.dimension[1], this.dimension[2]);
	}
	
	this.mouseover  = function(){
		console.log("mouse over geometry!", this.interfaceguid);
	}
	
	this.mouseout = function(){
		console.log("mouse out geometry!", this.interfaceguid);
	}
	
	this.t = 0;

	
})
