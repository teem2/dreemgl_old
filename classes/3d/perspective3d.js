// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(require, view, text, icon, teapot){

	// The perspective3d defines a 3d viewport

	var perspective3d = this.constructor;
	var thepot = teapot;
	
	// Basic usage. This demo shows a single teapot in a perspective view.
	define.example(this, function Usage(teapot){		
		return [
			view({height: 200, clipping:false,alignself:"stretch", alignitems: "stretch" , bgcolor:"green", flex: 1 }, 
				perspective3d({ bgcolor:"green", alignself:"stretch", flex:1,  fov:15,camera:vec3(-2,10,2)},
					thepot({scale3d:vec3(0.1)})
				)
			)
		]
	})
	
	// Field of view in degrees. 
	this.attribute("fov", {type:float, value: 30});
	
	// If set to true, the distance from camera to "lookat" point will be normalized to make items at the lookat point facing the camera be exactly 1 unit = 1 pixel.
	this.attribute("camerafixedtofov", {type:Boolean, value: false});
	
	// The point the camera is pointed at
	this.attribute("lookat", {type:vec3, value: vec3(0,0,0)});
	
	// A vector pointing at the direction you want to become "up" 
	this.attribute("up", {type:vec3, value: vec3(0,1,0)});
	
	// The point the camera is located at. If camerafixedtofov is set to true, this attribute is used to determine a direction from lookat instead of an absolute point. 
	this.attribute("camera", {type:vec3, value: vec3(0,1,10)});

	// Near plane distance
	this.attribute("near", {type:float, value: 0.1});
	
	// Far plane distance
	this.attribute("far", {type:float, value: 1000});

	this.state("up");
	this.state("lookat");
	this.state("camera");
	
	this.camerafixedtofov = function() {
	}
	
	this.fov = function(){
	}
	
	this.lookat = this.up = this.camera = function(){		
	}

	this.updateProjectionMatrix = function(){
		this.updateLookAtMatrix();
		
	}
	
	this.updateLookAtMatrix = function(){
		this.lookatmatrix = mat4.lookAt(this.camera, this.lookat, this.up);		
	}
		
	this.atDraw = function(renderstate){

		var w = this.layout.width>0? this.layout.width: this.layout.right - this.layout.left;
		var h = this.layout.height>0? this.layout.height: this.layout.bottom - this.layout.top;
		this.projectionmatrix = mat4.perspective(this.fov * 6.283/360, w/h, this.near, this.far);										
		
		var up = vec3(this.lookatmatrix[1], this.lookatmatrix[5], this.lookatmatrix[9]);
		var left = vec3(this.lookatmatrix[0], this.lookatmatrix[4], this.lookatmatrix[8]);
		renderstate.camup = up;
		renderstate.camleft = left;
		var adjust = mat4.identity();
		mat4.scale(adjust, vec3(w,h, 1), adjust);	

		var adjust2 = mat4.identity();
		adjust2 = mat4.transpose(mat4.translate(mat4.transpose(adjust2), vec3(w/2, h/2, 0)));

		renderstate.adjustmatrix  = mat4.mul(adjust,adjust2);		
		this.flattenmatrix = mat4.mul(mat4.mul(this.lookatmatrix, this.projectionmatrix),renderstate.adjustmatrix); 		
		renderstate.flattenmatrix = this.flattenmatrix;
	
		renderstate.projectionmatrix = mat4.mul(this.projectionmatrix, renderstate.adjustmatrix);
		renderstate.lookatmatrix = this.lookatmatrix;
		renderstate.cameraposition = this.camera;

	}
	
	this.init = function() {
		this.threedee = true;		
		this.updateProjectionMatrix();
		this.updateLookAtMatrix();
	}

})