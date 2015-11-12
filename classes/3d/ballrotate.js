// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, view, text, view, icon){
	if(define.$environment === 'nodejs') return

	// The perspective3d object to rotate.
	this.attributes = {target:{}}

	this.mouseleftdown = function(a){
		if (this.target) 
		{
			this.clickstart = a;
			
			this.mousemove = function(a){
				var dx = a[0] - this.clickstart[0];
				var dy = a[1] - this.clickstart[1];
				
				this.camerastart = vec3.sub(this.target.camera, this.target.lookat );
				var M4 = mat4.invert(this.target.flattenmatrix);
				
	//			console.log(M4);
				var screenup = vec3.normalize(vec3.vec3_mul_mat4(vec3(0,1,0), M4));
				
			//	var M = mat4.R(0,-dy*0.01,-dx*0.01);				
				
//				console.log("screenup:", screenup);
				
				var M1 = mat4.identity();
				var M2 = mat4.rotate(M1, dx*0.01, this.target.up)
				
				var axis = vec3.normalize(vec3.cross(this.camerastart, this.target.up));
				var M3 = mat4.rotate(M2, dy*0.01, axis)
				
				
				var Rot = vec3.vec3_mul_mat4(this.camerastart, M3);
				var Res = vec3.add(Rot, this.target.lookat);
				
				this.target.camera = Res;
				this.target.updateLookAtMatrix();
				this.target.setDirty();
				
				this.clickstart = a;
				this.camerastart = vec3.sub(this.target.camera, this.target.lookat );
				
			
			}.bind(this);
		}
	}

	this.mouseleftup = function(){
		this.mousemove = function(){};
	}	
})