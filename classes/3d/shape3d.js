// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(require, view, text, icon){
	if(define.$environment === 'nodejs') return

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLGeom= require('$gl/glgeom')
	var GLMat = require('$gl/glmaterial')
	
	
	this.attribute("pos3d", {type:vec3, value:vec3(0,0,0)});
	this.attribute("scale3d", {type:vec3, value:vec3(2)});
	this.attribute("rot3d", {type:vec3, value:vec3(0.)});
	this.attribute("anchor", {type:vec3, value:vec3(0.)});
	
	
	this.anchor = this.pos3d = this.scale3d = this.rot3d = function(){
		this.setDirty();
	}
	
	this.atDraw = function(renderstate){		
		var mat =mat4.TSRT2(this.anchor, this.scale3d, this.rot3d, this.pos3d);

		var normalmat = mat4.transpose(mat4.normalFromMat4(mat4.transpose(mat)));

		this.bg_shader._modelmatrix =  mat;
		this.bg_shader._camup =  renderstate.camup;
		this.bg_shader._camleft =  renderstate.camleft;
		this.bg_shader._normalmatrix =  normalmat;
		this.bg_shader._projectionmatrix = renderstate.projectionmatrix;
		this.bg_shader._lookatmatrix = renderstate.lookatmatrix;
		this.bg_shader._cameraposition = renderstate.cameraposition;
	//	this.bg_shader.adjustmatrix1 = renderstate.adjustmatrix1;
		//this.bg_shader.adjustmatrix2 = renderstate.adjustmatrix2;
		this.bg_shader._flattenmatrix = renderstate.flattenmatrix;
		var adjust = mat4.identity();;
		
			//adjust[3] = 300;
		this.bg_shader._scaler = renderstate.adjustmatrix;
		
		
	}
	
	this.init = function(){
		this.bg_shader.mesh = this.bg_shader.vertexstruct.array();
//		this.bg_shader.buildGeometry();
	}
	
	define.class(this, 'bg', GLShader, function(){
		
		this.attribute("shape", {type: String, value: "cube"} );
		
		this.depth_test = 'src_depth < dst_depth';
		
		this.vertexstruct = define.struct({
			pos: vec3,
			norm: vec3,
			uv: vec2			
		})
	
		this.diffusecolor = vec4("#ffffff");
		this.texture = new GLTexture()
		this.mesh = this.vertexstruct.array();
		this.has_guid = true;
		
		this.addPlane = function(width, height, xdiv, ydiv){
			GLGeom.createPlane(width,height,xdiv,ydiv,function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)
		}
		
		this.addBox = function(width, height, depth){
			if (width === undefined) width = 1;
			if (height === undefined) height = width;
			if (depth === undefined) depth = height;
			
			GLGeom.createCube(width,height,depth,function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)
		}
		
		this.addTeapot = function(radius, detail){
			GLGeom.createTeapot(radius, detail, function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)
		}
		
		this.addSphere = function(radius, xdetail, ydetail){
			if (radius === undefined) radius = 1;
			if (xdetail === undefined) xdetail = 20;
			if (ydetail === undefined) ydetail = 20;
			GLGeom.createSphere(radius,xdetail,ydetail,function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
					this.mesh.push(v1,n1,t1);
					this.mesh.push(v2,n2,t2);
					this.mesh.push(v3,n3,t3);
				}.bind(this)
			)		
		}
		
		 this.addModel = function(data, completioncallback){
						
			
			GLGeom.createModel(data, function(triidx,v1,v2,v3,n1,n2,n3,t1,t2,t3,faceidx){
				this.mesh.push(v1,n1,t1);
				this.mesh.push(v2,n2,t2);
				this.mesh.push(v3,n3,t3);
			}.bind(this))
			completioncallback();
					
		}
	
		this.texture = require('$textures/envmap1.png');

		this.matrix = mat4.identity()
		this.cameraposition = vec3(0,0,0)
		this.modelmatrix = mat4.identity();
		this.projectionmatrix = mat4.identity();
		this.dimension = vec2(1025,1025);
		this.normalmatrix = mat4.identity();
		this.lookatmatrix = mat4.identity();
		this.screenup = vec3(0,1,0);
		this.screenleft = vec3(-1,0,0);
		this.flattenmatrix = mat4.identity();
		this.viewmatrix = mat4.identity();				
		this.camup = vec3();
		this.camleft = vec3();
		this.position = function() {						
			var temp = (vec4(mesh.norm,1.0) * normalmatrix  );						
			transnorm = temp.xyz;			
			
			pos = vec4(mesh.pos, 1) * modelmatrix * lookatmatrix;
			
			campos = vec4(cameraposition, 1.0) * lookatmatrix;
			return pos  * projectionmatrix * matrix * viewmatrix; // * matrix *viewmatrix
		}
				
		this.color = function() {
			//return vec4("yellow") ;			
			var n = noise.s2d(vec2(sin(mesh.uv.x*6.283)*0.215, sin(mesh.uv.y*6.283)));

			var raydir = -normalize( pos.xyz - campos.xyz);
			
			var tn = normalize(transnorm.xyz);
			var res =texture.sample(vec2(0.5)- 0.5*material.matcap(tn,raydir));
			
			var r1 = cross(raydir, camup);
			var r2 = cross(raydir, r1);
			var angle = atan(tn.y, tn.x);
			//return vec4(res.xyz,1) * diffusecolor;
			var d = dot(cross(camup, camleft), tn);
			//return vec4(d * vec3(1,1,1)  * 0.5 + vec3(0.5) , 1.0)
			return texture.sample(-vec2(dot(tn, r1), dot(tn,r2)) * 0.5 + vec2(0.5)) * diffusecolor;
//			return vec4(dot(raydir, tn)*vec3(1,1,1),1.);
//			return vec4(vec3(0.5+0.5*sin((1-pow(dot(raydir, tn), 1. )) * 20.)), 1.0)  * diffusecolor + vec4(angle,0,0,0);

			//+ sin(dot(r1, tn)*10.)*vec3(1,1,0) , 1.0);
			
			
			
			
	//		res.xyz *= 0.1*n + 0.9;
	//		return vec4(res.x *diffusecolor.x, res.y * diffusecolor.y, res.z*diffusecolor.z, 1.0) ;
			
			//return vec4(l,l,l,1.0);		
			
		}
	})		
})
