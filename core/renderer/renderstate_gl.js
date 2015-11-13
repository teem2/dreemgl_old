/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(require, exports, self){
	
	this.pushClipRect = function(rect){
		var previousdepth = this.clipStack.length;
		this.clipStack.push(rect);		
		var gl = this.device.gl;
		
// 		console.log("clipdepth: ", previousdepth, "frame: ", this.frame);

		gl.enable(gl.STENCIL_TEST);				
		gl.colorMask(true, true,true,true);
		gl.stencilFunc(gl.EQUAL, previousdepth, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
	}
	
	this.setupPerspective = function() {
		var gl = this.device.gl;
//		gl.enable(gl.DEPTH_TEST);		
//		gl.enable(gl.CULL_FACE);
	}
	
	this.popPerspective = function() {
		var gl = this.device.gl;
	//	gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);		
	}
	
	this.pushClip = function( sprite){
		
		this.pushClipRect(sprite.boundingrect);
	}
	
	this.translate = function(x,y){
		var m2 = mat4.T(x,y,0);
	//	this.matrix = mat4.mul(this.matrix, m2);
		this.viewmatrix = mat4.mul( m2, this.viewmatrix);
	}
	
	this.stopClipSetup = function(){
		var gl = this.device.gl;
		var depth = this.clipStack.length
		
		//gl.colorMask(true,true,true,true);
	
		gl.stencilFunc(gl.EQUAL, depth, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);	
	}
	
	this.popClip = function(sprite) {
		
		this.clipStack.pop();
		var previousdepth = this.clipStack.length;
		var gl = this.device.gl;
		
		//gl.enable(gl.STENCIL_TEST);		// should still be enabled!
		gl.colorMask(gl.FALSE, gl.FALSE, gl.FALSE, gl.FALSE);
		gl.stencilFunc(gl.EQUAL, previousdepth +1, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

		// this erases the current sprite from the stencilmap
		if (sprite) sprite.drawStencil(this);
		
		gl.colorMask(true,true,true,true);
		gl.stencilFunc(gl.EQUAL, previousdepth , 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);			
	}
	
this.frame =0;

	this.setup = function(device, viewportwidth, viewportheight, offx, offy){
		if (offx === undefined) offx = 0;
		if (offy === undefined) offy = 0;
		this.device = device;
		this.clipStack = [];
		this.frame++;
		
		if (viewportwidth === undefined) viewportwidth = device.size[0];
		if (viewportheight === undefined) viewportheight = device.size[1];
		
		this.uimode = true;
		this.matrix = mat4.identity();
		this.viewmatrix = mat4.ortho(0 + offx, device.size[0] + offx, 0 + offy, device.size[1] + offy, 1, -1);
		//this.device.gl.scissor(0,0, viewportwidth * device.ratio, viewportheight * device.ratio);
		this.device.gl.viewport(0, 0, device.size[0] * device.ratio, device.size[1] * device.ratio)
		this.device.gl.clearStencil(0);
		this.cliprect = rect(0,0, device.size[0], device.size[1]);
	}
})
