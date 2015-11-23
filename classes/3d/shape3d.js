/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(require, view, icon){

	//var GLShader = require('$gl/glshader')
	//var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$core/geometry/basicgeometry')
	//var GLMat = require('$gl/glmaterial')
	
	
	
	define.class(this, 'bg', this.Shader, function(){
		
		//this.attribute("shape", {type: String, value: "cube"} );
		
		this.depth_test = 'src_depth < dst_depth';
		
		this.update = function(){
		}
		
		this.vertexstruct = define.struct({
			pos: vec3,
			norm: vec3,
			uv: vec2			
		})
	
		this.diffusecolor = vec4("#ffffff");
		this.texture = new this.Texture()
		this.has_guid = true;
		this.mesh = this.vertexstruct.array();
		
		
		this.setPlane = function(width, height, xdiv, ydiv){
			this.mesh = this.vertexstruct.array();
		
			GLGeom.createPlane(width,height,xdiv,ydiv,function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)
		}
		
		this.setBox = function(width, height, depth){
			if (width === undefined) width = 1;
			if (height === undefined) height = width;
			if (depth === undefined) depth = height;
			this.mesh = this.vertexstruct.array();
		
			
			GLGeom.createCube(width,height,depth,function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)
			
			
		}
		
		this.setTeapot = function(radius, detail){
			this.mesh = this.vertexstruct.array();
		
			GLGeom.createTeapot(radius, detail, function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)
		}
		
		this.setSphere = function(radius, xdetail, ydetail){
			if (radius === undefined) radius = 1;
			if (xdetail === undefined) xdetail = 20;
			if (ydetail === undefined) ydetail = 20;
			this.mesh = this.vertexstruct.array();
		
			GLGeom.createSphere(radius,xdetail,ydetail,function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)		
		}
		
		 this.setModel = function(data, completioncallback){
						
			this.mesh = this.vertexstruct.array();
		
			GLGeom.createModel(data, function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
				this.mesh.push(v1,n1,t1);
				this.mesh.push(v2,n2,t2);
				this.mesh.push(v3,n3,t3);
			}.bind(this))
			completioncallback();
					
		}
	
		this.texture = require('$textures/envmap1.png');

		
		this.position = function() {						
			
			var temp = (vec4(mesh.norm,1.0) * view.normalmatrix  );						
			transnorm = temp.xyz;			
			
			pos = vec4(mesh.pos, 1) * view.modelmatrix * view.viewmatrix;
			
			//campos = vec4(cameraposition, 1.0) * lookatmatrix;
			return pos ; // * matrix *viewmatrix
		}
				
		this.color = function() {
			//return vec4("yellow") ;			
			
			var tn = normalize(transnorm.xyz);
			
			return vec4(tn*0.5+0.5,1.0);		
			
		}
	})		
})
