// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(require, exports, self){

	var Shader = require('$gl/glshader')
	var Texture = require('$gl/gltexture')

	this.frame = 
	this.main_frame = Texture.rgb_depth_stencil()
	
	this.preserveDrawingBuffer = true
	this.antialias = false
	
	this.atConstructor = function(){
		this.extensions = {}
		this.shadercache = {}
		
		this.animFrame = function(time){
			this.anim_req = false
			this.atRedraw(time)
		}.bind(this)
	
		if(!this.parent) this.parent = document.body

		this.canvas = document.createElement("canvas")
		this.canvas.className = 'unselectable'
		this.parent.appendChild(this.canvas)
		
		var options = {
			alpha: this.frame.type.indexOf('rgba') != -1,
			depth: this.frame.type.indexOf('depth') != -1,
			stencil: this.frame.type.indexOf('stencil') != -1,
			antialias: this.antialias,
			premultipliedAlpha: this.premultipliedAlpha,
			preserveDrawingBuffer: this.preserveDrawingBuffer,
			preferLowPowerToHighPerformance: this.preferLowPowerToHighPerformance
		}

		this.gl = this.canvas.getContext('webgl', options) || 
			this.canvas.getContext('webgl-experimental', options) || 
			this.canvas.getContext('experimental-webgl', options)
		if(!this.gl){
			console.log(this.canvas)
			console.log("Could not get webGL context!")
		}
		// require derivatives
		this.getExtension('OES_standard_derivatives')

		//canvas.webkitRequestFullscreen()
		var resize = function(){
			var pixelRatio = window.devicePixelRatio
			var w = this.parent.offsetWidth
			var h = this.parent.offsetHeight
			var sw = w * pixelRatio
			var sh = h * pixelRatio
			this.gl.width = this.canvas.width = sw
			this.gl.height = this.canvas.height = sh
			this.canvas.style.width = w + 'px'
			this.canvas.style.height = h + 'px'

			this.gl.viewport(0, 0, sw, sh)
			// store our w/h and pixelratio on our frame
			this.main_frame.ratio = pixelRatio
			this.main_frame.size = vec2(sw, sh) // actual size
			this.size = vec2(w, h)
			this.ratio = this.main_frame.ratio
		}.bind(this)

		window.onresize = function(){
			resize()
			this.atResize()
			this.redraw()
		}.bind(this)

		resize()

		setTimeout(function(){
			this.redraw()
		}.bind(this),0)
	}

	this.clear = function(r, g, b, a){
		if(arguments.length === 1){
			a = r.length === 4? r[3]: 1, b = r[2], g = r[1], r = r[0]
		}
		if(arguments.length === 3) a = 1
		this.gl.clearColor(r, g, b, a)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT|this.gl.STENCIL_BUFFER_BIT)
	}

	this.atRedraw = function(time){}
	this.atResize = function(callback){}

	this.getExtension = function(name){
		var ext = this.extensions[name]
		if(ext) return ext
		return this.extensions[name] = this.gl.getExtension(name)
	}

	this.redraw = function(){
		if(this.anim_req) return
		this.anim_req = true
		window.requestAnimationFrame(this.animFrame)
	}

	this.setTargetFrame = function(frame){
		if(!frame) frame = this.main_frame
		this.frame = frame
		this.size = vec2(frame.size[0]/frame.ratio, frame.size[1]/frame.ratio)

		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frame.frame_buf)
		this.gl.viewport(0, 0, frame.size[0], frame.size[1])
	}

	this.readPixels = function(x, y, w, h){
		var buf = new Uint8Array(w*this.ratio*h*this.ratio*4);
		this.gl.readPixels(x * this.ratio, y * this.ratio, w * this.ratio, h * this.ratio, this.gl.RGBA, this.gl.UNSIGNED_BYTE, buf);
		return buf
	}
})