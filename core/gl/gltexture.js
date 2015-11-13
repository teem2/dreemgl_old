// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(require, exports, self){
	var Texture = exports

	this.atConstructor = function(type, w, h){
		this.type = type
		this.size = vec2(w, h)
	}

	this.ratio = 1
	this.isTexture = true
	this.frame_buf = null

	exports.fromImage = function(img){
		var tex = new Texture('rgba', img.width, img.height)
		tex.image = img
		return tex
	}

	exports.fromArray = function(array, w, h){
		var tex = new Texture('rgba', w, h)
		tex.array = array
		return tex
	}

	var buf_list = [
		'rgb',
		'rgba',
		'luminance',
		'alpha',
		'alpha_luminance',
		'luminance_alpha'
	]
	var bpp_list = [
		'',
		'_half_float',
		'_float',
		'_half_float_linear',
		'_float_linear'
	]
	var attach_list = [
		'',
		'_depth',
		'_stencil',
		'_stencil_depth',
		'_depth_stencil'
	]
	var num_list = [
		'',
		'_flipped',
		'_shared'
	]

	function gen_api(where){
		function gen_call(name){
			return function(w, h){
				return new Texture(name, w, h)
			}
		}
		buf_list.forEach(function(buf){
			bpp_list.forEach(function(bpp){
				attach_list.forEach(function(attach){
					num_list.forEach(function(num){
						var name = buf + bpp + attach + num
						where[name] = gen_call(name)
					})
				})
			})
		})
	}
	gen_api(exports)

	this.size = vec2(0, 0)

	// well lets do it like this.
	this.sample2 = function(x, y){ return sample(vec2(x, y)) }
	this.sample = function(v){
		return texture2D(this, v, {
			MIN_FILTER: 'LINEAR',
			MAG_FILTER: 'LINEAR',
			WRAP_S: 'CLAMP_TO_EDGE',
			WRAP_T: 'CLAMP_TO_EDGE'
		})
	}

	this.flipped2 = function(x,y){ return flipped(vec2(x,y)) }
	this.flipped = function(v){
		return texture2D(this, vec2(v.x, 1. - v.y), {
			MIN_FILTER: 'LINEAR',
			MAG_FILTER: 'LINEAR',
			WRAP_S: 'CLAMP_TO_EDGE',
			WRAP_T: 'CLAMP_TO_EDGE'
		})
	}
	
	this.point2 = function(x, y){ return point(vec2(x, y)) }
	this.point = function(v){
		return texture2D(this, vec2(v.x, v.y), {
			MIN_FILTER: 'NEAREST',
			MAG_FILTER: 'NEAREST',
			WRAP_S: 'CLAMP_TO_EDGE',
			WRAP_T: 'CLAMP_TO_EDGE'
		})
	}
	
	this.point_flipped2 = function(x, y){ return point_flipped(vec2(x, y)) }
	this.point_flipped = function(v){
		return texture2D(this, vec2(v.x, 1. - v.y), {
			MIN_FILTER: 'NEAREST',
			MAG_FILTER: 'NEAREST',
			WRAP_S: 'CLAMP_TO_EDGE',
			WRAP_T: 'CLAMP_TO_EDGE'
		})
	}

	this.createGLTexture = function(gl, texid, texinfo){
		var samplerid = texinfo.samplerid

		if(this.image && this.image[samplerid]){
			this[samplerid] = this.image[samplerid]
		}

		if(this[samplerid]){
			var gltex = this[samplerid]
			gl.activeTexture(gl.TEXTURE0 + texid)
			gl.bindTexture(gl.TEXTURE_2D, gltex)
			return gltex
		}

		var samplerdef = texinfo.samplerdef
		var gltex = gl.createTexture()
		gl.activeTexture(gl.TEXTURE0 + texid)
		gl.bindTexture(gl.TEXTURE_2D, gltex)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, samplerdef.UNPACK_FLIP_Y_WEBGL || false)
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, samplerdef.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)

		if(this.array){
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.size[0], this.size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.array)) 
		}
		else if(this.image){
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image)
			this.image[samplerid] = gltex
		}
		else{
			return undefined
		}
		
		gltex.updateid = this.updateid
		// set up sampler parameters
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[samplerdef.MIN_FILTER])
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[samplerdef.MAG_FILTER])

		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[samplerdef.WRAP_S])
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[samplerdef.WRAP_T])

		this[samplerid] = gltex
		return gltex
	}

	this.updateGLTexture = function(gl, gltex){
		if(this.array){
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.size[0], this.size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.data)) 
		}
		else if(this.image){
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image)
		}
		gltex.updateid = this.updateid
	}


	// remote nesting syntax
	this.allocRenderTarget = function(gldevice){
		var gl = gldevice.gl

		var width = this.size[0], height = this.size[1]

		var fb = this.frame_buf = gl.createFramebuffer()
		var tex = this.AL_IL_SC_TC = gl.createTexture()
		var type = this.type

		// our normal render to texture thing
		gl.bindTexture(gl.TEXTURE_2D, tex)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

		var buf_type = gl.RGB
		if(type.indexOf('luminance') != -1){
			buf_type = gl.LUMINANCE
			if(type.indexOf('alpha') != -1) buf_type = gl.LUMINANCE_ALPHA
		}
		else if(type.indexOf('alpha') != -1) buf_type = gl.ALPHA
		else if(type.indexOf('rgba') != -1) buf_type = gl.RGBA

		var data_type = gl.UNSIGNED_BYTE
		if(type.indexOf('half_float_linear') != -1){
			var ext = gl._getExtension('OES_texture_half_float_linear')
			if(!ext) throw new Error('No OES_texture_half_float_linear')
			data_type = ext.HALF_FLOAT_LINEAR_OES
		}
		else if(type.indexOf('float_linear') != -1){
			var ext = gl._getExtension('OES_texture_float_linear')
			if(!ext) throw new Error('No OES_texture_float_linear')
			data_type = ext.FLOAT_LINEAR_OES
		}
		else if(type.indexOf('half_float') != -1){
			var ext = gl._getExtension('OES_texture_half_float')
			if(!ext) throw new Error('No OES_texture_half_float')
			data_type = ext.HALF_FLOAT_OES
		}
		else if(type.indexOf('float') != -1){
			var ext = gl._getExtension('OES_texture_float')
			if(!ext) throw new Error('No OES_texture_float')
			data_type = gl.FLOAT
		}

		gl.texImage2D(gl.TEXTURE_2D, 0, buf_type, width, height, 0, buf_type, data_type, null)
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)

		var has_depth = type.indexOf('depth') != -1 
		var has_stencil = type.indexOf('stencil') != -1
		if(has_depth || has_stencil){

			if(!this.depth_buf) this.depth_buf = gl.createRenderbuffer()

			var dt = gl.DEPTH_COMPONENT16, at = gl.DEPTH_ATTACHMENT
			if(has_depth && has_stencil) dt = gl.DEPTH_STENCIL, at = gl.DEPTH_STENCIL_ATTACHMENT
			else if(has_stencil) dt = gl.STENCIL_INDEX, at = gl.STENCIL_ATTACHMENT

			gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth_buf)
			gl.renderbufferStorage(gl.RENDERBUFFER, dt, width, height)
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, at, gl.RENDERBUFFER, this.depth_buf)

			gl.bindRenderbuffer(gl.RENDERBUFFER, null)
		}
		gl.bindTexture(gl.TEXTURE_2D, null)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	}
})