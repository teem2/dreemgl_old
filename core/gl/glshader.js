// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class('$base/node', function(require, exports, self){
	if(define.$environment === 'nodejs') return

	var GLTexture = require('$gl/gltexture')
	var OneJSParser =  require('$parsers/onejsparser')
	var GLSLGen = require('$gl/glslgen')
	var gltypes = require('$gl/gltypes')
	var dump = require('$parsers/astdumper')
	var astdef = require('$parsers/onejsdef')

	this.default_texture = GLTexture.fromArray(new Float32Array(4*4*4), 4,4)

	this.noise = require('$gl/glnoise')
	this.pal = require('$gl/glpalette')
	this.shape = require('$gl/glshape')
	this.math = require('$gl/glmath')
	this.demo = require('$gl/gldemo')
	this.material = require('$gl/glmaterial')

	this.RAD = '1'
	this.DEG = '0.017453292519943295'
	this.PI = '3.141592653589793'
	this.PI2 = '6.283185307179586'
	this.E = '2.718281828459045'
	this.LN2 = '0.6931471805599453'
	this.LN10 = '2.302585092994046'
	this.LOG2E = '1.4426950408889634'
	this.LOG10E = '0.4342944819032518'
	this.SQRT_1_2 = '0.70710678118654757'
	this.SQRT2 = '1.4142135623730951'

	// we can use singletons of these stateless classes
	var onejsparser = new OneJSParser()
	onejsparser.parser_cache = {}
	var glslgen = new GLSLGen()

	this.atConstructor = function(obj){
		if(obj) for(var key in obj) this[key] = obj[key]
	}

	this.extensions = ''
	// put extensions as setters to not have to scan for them
	function defExt(ext){
		Object.defineProperty(self, key,{
			get:function(){
				this.extensions.indexOf(ext) !== -1
			},
			set:function(value){
				if(this.extensions.indexOf(ext) !== -1)
					return
				if(this.extensions) this.extensions += '|'
				this.extensions += ext
			}
		})
	}
	for(var key in gltypes.extensions) defExt(key)

	this.OES_standard_derivatives = 1

	this.precision = 'highp'

	this.compileHeader = function(){
		// ehm how do we find extensions to enable?
		var ret = 'precision ' + this.precision + ' float;\n'
		//	'precision ' + this.precision + ' int;'

		//var ret = ''
		for(var i = 0, exts = this.extensions.split('|'); i<exts.length; i++){
			var ext = exts[i]
			if(gltypes.extensions[ext] === 1)
				ret += '\n#extension GL_' + ext + ' : enable'
		}
		return ret + '\n'
	}

	this.compileAttributes = function(vtxattr, pixattr){
		var ret = ''
		var attr = {}
		if(vtxattr) for(var key in vtxattr){
			var gltype = gltypes.getType(vtxattr[key])
			ret += 'attribute ' + gltype + ' _' + key + ';\n'
			attr[key] = gltype
		}
		if(pixattr) for(var key in pixattr) if(!(key in vtxattr)){
			var gltype = gltypes.getType(pixattr[key])
			ret += 'attribute ' + gltype + ' _' + key + ';\n'
			attr[key] = gltype
		}
		for(var key in attr){
			var gltype = attr[key]
			// ok so if key is not in pixattr, its a normal one
			if(!pixattr || !(key in pixattr)){
				ret += gltype + ' ' + key  + ';\n'
			}
			else{
				ret += 'varying ' + gltype + ' ' + key  + ';\n'
			}
		}
		return ret
	}

	this.compileAttribRename = function(vtxattr, pixattr){
		var ret = ''
		if(vtxattr) for(var key in vtxattr){
			ret += '\t' + key + ' =  _' + key + ';\n'
		}
		if(pixattr) for(var key in pixattr) if(!(key in vtxattr)){
			ret += '\t' + key + ' =  _' + key + ';\n'
		}
		return ret
	}

	this.compileVaryings = function(varyings, name){
		var ret = ''
		for(var key in varyings){
			var gltype = gltypes.getType(varyings[key])
			ret += 'varying ' + gltype + ' ' + key + ';\n'
		}
		if(ret) ret = '//------------------- '+name+' -------------------\n'+ret+'\n'
		return ret
	}

	this.compileUniforms = function(uniforms){
		var ret = ''
		for(var key in uniforms){
			var gltype = gltypes.getType(uniforms[key])
			ret += 'uniform ' + gltype + ' _' + key + ';\n'
			ret += gltype + ' ' + key + ';\n'
		}
		if(ret) ret = '//------------------- Uniforms -------------------\n'+ret+'\n'
		return ret
	}

	this.compileUniformRename = function(uniforms){
		var ret = ''
		for(var key in uniforms){
			ret += '\t' + key + ' = _' + key + ';\n'
		}
		return ret
	}

	this.compileFunctions = function(call, mask){
		var ret = ''
		var init
		if(!mask) mask = {}, init = true
		if(call.name in mask) return ''
		mask[call.name] = 1
		// output dependencies first
		for(var key in call.deps){
			var dep = call.deps[key]
			ret += this.compileFunctions(dep, mask)
		}
		if(call.code) ret += '\n'+call.code +'\n'
		if(init) ret = '//------------------- Functions -------------------' +  ret + '\n'
		return ret
	}

	this.compileTextures = function(textures){
		var ret = ''
		for(var key in textures){
			ret += 'uniform sampler2D ' + key + ';\n'
		}
		if(ret) ret = '//------------------- Textures -------------------\n'+ret+'\n'
		return ret
	}

	this.compileStructs = function(structs){
		var ret = ''
		for(var key in structs){
			var struct = structs[key]
			// ok so.. we need to write the struct
			ret += 'struct ' + key + '{\n'
			var defs = struct.def
			for(var slotname in defs){
				var slot = defs[slotname]
				if(typeof slot === 'function'){
					ret += '\t' + gltypes.getType(slot) + ' ' + slotname + ';\n'
				}
			}
			ret += '};\n'
		}
		if(ret) ret = '\n//------------------- Structs -------------------\n'+ret+'\n'
		return ret
	}

	this.mapUniforms = function(gl, shader, uniforms, uniset, unilocs){
		for(var key in uniforms) if(!uniset[key]){
			var type = gltypes.getType(uniforms[key])
			uniset[key] = gltypes.uniforms[type]
			var loc = unilocs[key] = {
				type: type,
				loc:gl.getUniformLocation(shader, '_' + key)
			}
			if(key.indexOf('_DOT_') !== -1) loc.split = key.split(/_DOT_/)
		}
	}

	this.mapTextures = function(gl, shader, textures, texlocs){
		for(var key in textures){
			var tex = textures[key]
			var loc = texlocs[key] = {
				loc: gl.getUniformLocation(shader, key),
				samplerdef: tex.samplerdef,
				samplerid: tex.samplerid,
				name: tex.name
			}
			if(tex.name.indexOf('_DOT_') !== -1) loc.split = tex.name.split(/_DOT_/)
		}		
	}

	this.mapAttributes = function(gl, shader, attributes, attrlocs, context){
		for(var key in attributes){
			var loc = attrlocs[key] = {
				loc:gl.getAttribLocation(shader, '_' + key)
			}
			if(key.indexOf('_DOT_') !== -1){
				// okay lets look up the type
				var split = key.split(/_DOT_/)
				// ok so we need to look up split[0] on context
				var name = loc.name = split[0]
				var geom = context[name]
				var last = geom.struct
				var offset = 0
				for(var i = 1; i < split.length; i++){					
					// lets find split on our struct
					var info = last.keyInfo(split[i])
					offset += info.offset
					last = info.type
				}
				if(!last) throw new Error('Cannot find attribute ' + key)
				loc.slots = last.slots
				loc.offset = offset
			}
		}
	}

	this.annotateLines = function(text){
		var lines = text.split(/\n/)
		var ret = ''
		for(var i = 0; i < lines.length; i++){
			ret += (i+1)+':  '+lines[i] + '\n'
		}
		return ret
	}

	this.toVec4 = function(str, ast, str2, ast2){
		if(ast.infer === vec4){
			if(ast2 && ast2.infer === float32){
				return '('+str+')*vec4(1.,1.,1.,'+str2+')'
			}
			return str
		}
		if(ast.infer === vec3){
			if(ast2 && ast2.infer === float32){
				return 'vec4('+str+','+str2+')'
			}
			return 'vec4(' + str + ',1.)'
		}
		if(ast.infer === vec2) return 'vec4(' + str + ',0.,1.)'
		if(ast.infer === float32) return '(' + str + ').xxxx'
		return str
	}

	this.decodeBlendFactor = function(node, key){
		var gl = gltypes.gl
		if(node.type == 'Id') return gl.ONE
		if(node.type == 'Binary'){
			var factor = node.left
			if(node.right.name != key) throw new Error('Blend equation needs to have either pixel or frame on the right side of the *')
			if(factor.type == 'Binary'){ // its a one minus situation
				if(factor.op != '-' || factor.left.type != 'Value' || factor.left.value != 1) throw new Error('Invalid blending (only 1- supported)')
				var name = factor.right.name
				if(name === 'src_alpha') return gl.ONE_MINUS_SRC_ALPHA
				if(name === 'src_color') return gl.ONE_MINUS_SRC_COLOR
				if(name === 'dst_color') return gl.ONE_MINUS_DST_COLOR
				if(name === 'dst_alpha') return gl.ONE_MINUS_DST_ALPHA
				if(name === 'constant_color') return GL.ONE_MINUS_CONSTANT_COLOR
				if(name === 'constant_alpha') return GL.ONE_MINUS_CONSTANT_ALPHA
				throw new Error('implement one minus mode')
			}
			if(factor.type != 'Id') throw new Error('Invalid blending (factor not an Id)')
			var name = factor.name
			if(name === 'src_alpha') return gl.SRC_ALPHA
			if(name === 'src_color') return gl.SRC_COLOR
			if(name === 'dst_color') return gl.DST_COLOR
			if(name === 'dst_alpha') return gl.DST_ALPHA
			if(name === 'constant_color') return GL.CONSTANT_COLOR
			if(name === 'constant_alpha') return GL.CONSTANT_ALPHA
			// todo constant color and constant alpha
		}
		throw new Error('Invalid blending factor (node type invalid)')
	}

	this.decodeBlendEquation = function(eq, value){
		var gl = gltypes.gl
		var out = {original:value}
		if(!eq) return out
		if(eq.type == 'Binary' && (eq.op == '+' || eq.op == '-')){ // its the main equation
			var left = eq.left
			var right = eq.right

			if(eq.op == '+') out.op = gl.FUNC_ADD
			else if(eq.op == '-') out.op = gl.FUNC_SUBTRACT

			if(left.type == 'Id' && left.name == 'src_color' || 
			   left.type == 'Binary' && left.right.name == 'src_color'){
				left = eq.right, right = eq.left
				if(eq.op == '-') out.op = gl.FUNC_REVERSE_SUBTRACT
			}
			// left should be frame, right should be pixel
			out.dst = this.decodeBlendFactor(left, 'dst_color')
			out.src = this.decodeBlendFactor(right, 'src_color')
		}
		else if(eq.type == 'Binary' && eq.op == '*'){ // its a single mul
			out.op = gl.FUNC_ADD
			// the right side needs to be either frame or pixel
			if(eq.right.name == 'dst_color'){
				out.src = gl.ZERO
				out.dst = this.decodeBlendFactor(eq, 'dst_color')
			}
			else if(eq.right.name == 'src_color'){
				out.dst = gl.ZERO
				out.src = this.decodeBlendFactor(eq, 'src_color')
			}
			else throw new Error('Blend equation needs to have either pixel or frame on the right side of the *')
		} 
		else if(eq.type == 'Id'){
			out.op = gl.FUNC_ADD
			if(eq.name == 'dst_color'){
				out.src = gl.ZERO
				out.dst = gl.ONE
			}
			else if(eq.name == 'src_color'){
				out.src = gl.ONE
				out.dst = gl.ZERO
			}
			else{
				throw new Error('Blend equation invalid (not frame or pixel)')
			}
		}
		else throw new Error('Blend equation invalid (main type) ' + eq.type + ' ' + eq.op)
		return out
	}

	this.decodeDepthEquation = function(eq, value){
		var out = {original:value}
		if(!eq) return out
		if(eq.type == 'Logic' && eq.left.name == 'src_depth' && eq.right.name == 'dst_depth'){
			out.func = gltypes.compare[eq.op]
			return out
		}
		else throw new Error('depth eqation not in pixel > frame format')
	}

	this.decodeStencilEquation = function(gl, eq, value){
		if(!eq) return {}
		else 
		if(eq.type == 'Value'){

		}
	}
	var blend_eq_cache = {}
	// lets define the blending equation setters
	Object.defineProperty(self, 'color_blend', {
		get:function(){ return this.color_blend_eq && this.color_blend_eq.original },
		set:function(value){
			this.color_blend_eq = blend_eq_cache[value] || (blend_eq_cache[value] = this.decodeBlendEquation(onejsparser.parse(value).steps[0], value))
		}
	})

	Object.defineProperty(self, 'alpha_blend', {
		get:function(){ return this.alpha_blend_eq && this.alpha_blend_eq.original },
		set:function(value){
			this.alpha_blend_eq = blend_eq_cache[value] || (blend_eq_cache[value] = this.decodeBlendEquation(onejsparser.parse(value).steps[0], value))
		}
	})

	var depth_eq_cache = {}
	Object.defineProperty(self, 'depth_test', {
		get:function(){ return this.depth_test_eq && this.depth_test_eq.original },
		set:function(value){
			this.depth_test_eq = depth_eq_cache[value] || (depth_eq_cache[value] = this.decodeDepthEquation(onejsparser.parse(value).steps[0], value))
		}
	})

	this.alpha_blend = ''
	//this.depth_test = 'src_depth > dst_depth'
	this.depth_test = ''
	this.color_blend = '(1 - src_alpha) * dst_color + src_alpha * src_color'

	this.alpha = ''
	this.color = vec4(0,1,0,1)

	this.has_guid = false

	this.monitorCompiledProperty = function(name, init){
		var get = '_' + name
		this[get] = init
		Object.defineProperty(this, name, {
			enumerable:false,
			configurable:false,
			get:function(){
				return this[get]
			},
			set:function(value){
				if(this[get] === value) return
				this.dirty = true
				// trigger a recompile
				if(this.hasOwnProperty('shader')) this.shader = undefined
				this[get] = value
			}
		})
	}
	
	this.getLocations = function(gl, shader, vtx_state, pix_state){
		// get uniform locations
		var uniset = shader.uniset = {}
		var unilocs = shader.unilocs = {}
		this.mapUniforms(gl, shader, vtx_state.uniforms, uniset, unilocs)
		this.mapUniforms(gl, shader, pix_state.uniforms, uniset, unilocs)

		// lets get sampler2D uniforms
		var texlocs = shader.texlocs = {}
		this.mapTextures(gl, shader, vtx_state.textures, texlocs)
		this.mapTextures(gl, shader, pix_state.textures, texlocs)

		// get attribute locations
		var attrlocs = shader.attrlocs = {}
		this.mapAttributes(gl, shader, vtx_state.attributes, attrlocs, this)
		this.mapAttributes(gl, shader, pix_state.attributes, attrlocs, this)		
	}

	this.compileShader = function(gldevice){
		var vtx_state = this.vtx_state
		var pix_state = this.pix_state
		var vtx_code = vtx_state.code
		var pix_color = pix_state.code_color
		var pix_guid = pix_state.code_guid
		var pix_debug = pix_state.code_debug

		var gl = gldevice.gl
		var cache_id = vtx_code + pix_color + this.has_guid
		var shader = gldevice.shadercache[cache_id]

		if(shader) return shader

		var vtx_shader = gl.createShader(gl.VERTEX_SHADER)
		gl.shaderSource(vtx_shader, vtx_code)
		gl.compileShader(vtx_shader)
		if (!gl.getShaderParameter(vtx_shader, gl.COMPILE_STATUS)){
			var err = gl.getShaderInfoLog(vtx_shader)
			console.log(err.toString(), this.annotateLines(vtx_code))
			throw new Error(err)
		}
		
		// compile the shader
		var pix_color_shader = gl.createShader(gl.FRAGMENT_SHADER)
		gl.shaderSource(pix_color_shader, pix_color)
		gl.compileShader(pix_color_shader)
		if (!gl.getShaderParameter(pix_color_shader, gl.COMPILE_STATUS)){
			var err = gl.getShaderInfoLog(pix_color_shader)

			console.log(err.toString(), this.annotateLines(pix_color))
			throw new Error(err)
		}

		shader = gldevice.shadercache[cache_id] = gl.createProgram()
		gl.attachShader(shader, vtx_shader)
		gl.attachShader(shader, pix_color_shader)
		gl.linkProgram(shader)
		this.getLocations(gl, shader, vtx_state, pix_state)

		if(this.compile_use) this.compileUse(shader)

		if(pix_debug){
			// compile the guid shader
			var pix_debug_shader = gl.createShader(gl.FRAGMENT_SHADER)
			gl.shaderSource(pix_debug_shader, pix_debug)
			gl.compileShader(pix_debug_shader)
			if (!gl.getShaderParameter(pix_debug_shader, gl.COMPILE_STATUS)){
				var err = gl.getShaderInfoLog(pix_debug_shader)
				console.log(err.toString(), this.annotateLines(pix_debug))
				throw new Error(err)
			}

			shader.debug = gl.createProgram()
			gl.attachShader(shader.debug, vtx_shader)
			gl.attachShader(shader.debug, pix_debug_shader)
			gl.linkProgram(shader.debug)
			// add our guid uniform
			this.getLocations(gl, shader.debug, vtx_state, pix_state)
			if(this.compile_use) this.compileUse(shader.debug)
		}

		if(this.has_guid){
			// compile the guid shader
			var pix_guid_shader = gl.createShader(gl.FRAGMENT_SHADER)
			gl.shaderSource(pix_guid_shader, pix_guid)
			gl.compileShader(pix_guid_shader)
			if (!gl.getShaderParameter(pix_guid_shader, gl.COMPILE_STATUS)){
				var err = gl.getShaderInfoLog(pix_guid_shader)

				console.log(err.toString(), this.annotateLines(pix))
				throw new Error(err)
			}

			shader.guid = gl.createProgram()
			gl.attachShader(shader.guid, vtx_shader)
			gl.attachShader(shader.guid, pix_guid_shader)
			gl.linkProgram(shader.guid)
			// add our guid uniform
			pix_state.uniforms['guid'] = vec4

			this.getLocations(gl, shader.guid, vtx_state, pix_state)

			if(this.compile_use) this.compileUse(shader.guid)
		}

		return shader		
	}

	// compile the shader
	this.compile = function(gldevice){

		if(gldevice && this.dirty === false && !this.hasOwnProperty('shader')){
			// lets walk up the prototype chain till we hit dirty === false
			var proto = this
			while(!proto.hasOwnProperty('dirty')){
				proto = Object.getPrototypeOf(proto)
			}
			if(!proto.hasOwnProperty('shader')){
				this.shader = proto.shader = this.compileShader(gldevice)
			}
			else{
				this.shader = proto.shader
			}
			return
		}
		// lets run the type inferencer on the pixel shader
		var vtx_ast = onejsparser.parse(this.position).steps[0]
		if(vtx_ast.type == 'Function') vtx_ast = onejsparser.parse('position()').steps[0]
		// ok lets run the vertex codegen.
		var vtx_state = glslgen.newState(this)
		var vtx_code = glslgen.expand(vtx_ast, undefined, vtx_state)

		// pixel
		var pix_state = glslgen.newState(this, vtx_state.varyings)

		// support both immediate and expression color
		if(this.color === undefined){
			return
		}
		if(typeof this.color === 'object'){
			if(this.color.length == 3) var pix_ast = {infer:vec3}
			else var pix_ast = {infer:vec4}
			var pix_code = '_color'
			pix_state.uniforms.color = pix_ast.infer
		}
		else{
			var pix_ast = onejsparser.parse(this.color).steps[0]
			if(pix_ast.type == 'Function') pix_ast = onejsparser.parse('color()').steps[0]
			var pix_code = glslgen.expand(pix_ast, undefined, pix_state)
		}

		// support imediate alpha value and alpha expressions
		if(typeof this.alpha === 'number'){
			pix_state.uniforms.alpha = float32
			var alpha_ast = {infer:float32}
			var alpha_code = '_alpha'
		}
		else{
			var alpha_ast = onejsparser.parse(this.alpha).steps[0]
			var alpha_code = ''
			if(alpha_ast && alpha_ast.type == 'Function') alpha_ast = onejsparser.parse('alpha()').steps[0]
			if(alpha_ast){
				alpha_code = glslgen.expand(alpha_ast, undefined, pix_state)
			}
		}
		var vtx = ''

		// if we have attributes in the pixelshader, we have to forward em
		// what we can do is if we have pix_attr we make them varying

		// lets generate the vertex shader
		vtx += this.compileHeader()
		vtx += this.compileStructs(vtx_state.structs)
		vtx += this.compileAttributes(vtx_state.attributes, pix_state.attributes)
		vtx += this.compileVaryings(vtx_state.varyings, 'Varyings')
		vtx += this.compileUniforms(vtx_state.uniforms)
		vtx += this.compileTextures(vtx_state.textures)
		vtx += this.compileFunctions(vtx_state.call)
		vtx += '//------------------- Vertex shader main -------------------\nvoid main(){\n'
		vtx += this.compileUniformRename(vtx_state.uniforms)
		vtx += this.compileAttribRename(vtx_state.attributes, pix_state.attributes)
		vtx += '\tgl_Position = ' + this.toVec4(vtx_code, vtx_ast) + ';\n'
		vtx += '}\n'

		var pix_base = '', pix_color = '', pix_guid = '', pix_debug = ''

		pix_base += this.compileHeader()
		if(pix_state.debug.type){
			this.debug_type = gltypes.getType(pix_state.debug.type)
			pix_base += this.debug_type + ' dbg;\n'
		}
		if(pix_state.dump.set){
			pix_base += 'vec4 dump;\n'
		}

		pix_base += this.compileStructs(pix_state.structs)
		pix_base += this.compileVaryings(pix_state.attributes, 'Attribute varyings')
		pix_base += this.compileVaryings(pix_state.varyings, 'Varyings')
		pix_base += this.compileUniforms(pix_state.uniforms)
		pix_base += this.compileTextures(pix_state.textures)
		pix_base += this.compileFunctions(pix_state.call)
	
		if(this.debug_type){
			pix_debug += pix_base
			pix_debug += '//------------------- Debug Pixel shader main -------------------\nvoid main(){\n'
			pix_debug += this.compileUniformRename(pix_state.uniforms)

			if(this.debug_type == 'int') pix_debug += '\tdbg = 20;\n'
			if(this.debug_type == 'float') pix_debug += '\tdbg = 20.;\n'
			if(this.debug_type == 'vec2') pix_debug += '\tdbg = vec2(.2,.2);\n'
			if(this.debug_type == 'ivec2') pix_debug += '\tdbg = ivec2(20,20);\n'
			if(this.debug_type == 'vec3') pix_debug += '\tdbg = vec3(.2,.2,.2);\n'
			if(this.debug_type == 'ivec3') pix_debug += '\tdbg = ivec3(20,20);\n'

			pix_debug += '\t' + this.toVec4(pix_code, pix_ast, alpha_code, alpha_ast) + ';\n'
			if(this.debug_type == 'int') pix_debug += '\tgl_FragColor = vec4(mod(abs(float(dbg)),256.)/255.,abs(float(dbg/256))/256.,dbg >= 0? 1.: 0.,1.);\n'
			if(this.debug_type == 'float') pix_debug += '\tgl_FragColor = vec4(mod(abs(dbg),1.),float(floor(abs(dbg))/256.),dbg >= 0.? 1.: 0.,1.);\n'
			if(this.debug_type == 'vec2') pix_debug += '\tgl_FragColor = vec4(clamp(dbg.x,0.,1.),clamp(dbg.y,0.,1.),0,1.);\n'
			if(this.debug_type == 'ivec2') pix_debug += '\tgl_FragColor = vec4(float(dbg.x)/255.,float(dbg.y)/255.,0,1.);\n'
			if(this.debug_type == 'vec3') pix_debug += '\tgl_FragColor = vec4(clamp(dbg.x,0.,1.),clamp(dbg.y,0.,1.),clamp(dbg.z,0.,1.),1.);\n'
			if(this.debug_type == 'ivec3') pix_debug += '\tgl_FragColor = vec4(float(dbg.x)/255.,float(dbg.y)/255.,float(dbg.z)/255.,1.);\n'
			pix_debug += '}\n'
		}

		pix_color += pix_base 

		pix_color += '//------------------- Color Pixel shader main -------------------\nvoid main(){\n'
		pix_color += this.compileUniformRename(pix_state.uniforms)
		if(pix_state.dump.set){
			pix_color += '\tdump = vec4(.5,.5,.5,1.);\n'
		}
		pix_color += '\tgl_FragColor = ' + this.toVec4(pix_code, pix_ast, alpha_code, alpha_ast) + ';\n'
		if(pix_state.dump.set){
			pix_color += '\tgl_FragColor = dump;\n'
		}
		pix_color += '}\n'

		pix_guid += pix_base
		pix_guid += 'uniform vec4 _guid;\n'
		pix_guid += '//------------------- GUID Pixel shader main -------------------\nvoid main(){\n'
		pix_guid += this.compileUniformRename(pix_state.uniforms)
		pix_guid += '\t' + this.toVec4(pix_code, pix_ast, alpha_code, alpha_ast) + ';\n'
		pix_guid += '\tgl_FragColor = _guid;\n'
		pix_guid += '}\n'

		if(this.dump){
			console.log(vtx)
			console.log(pix_color)
			console.log(pix_guid)
			console.log(pix_debug)
		}
		vtx_state.code = vtx
		pix_state.code_color = pix_color
		pix_state.code_guid = pix_guid
		pix_state.code_debug = pix_debug

		this.pix_state = pix_state
		this.vtx_state = vtx_state

		//if(!this.device){
		// turn shader into dirty observed thing
		var keys = Object.keys(this)
		for(var i = 0; i < keys.length; i++){
			var key = keys[i]
			if(this.__lookupGetter__(key) || key.indexOf('_') === 0 ) continue
			var prop = this[key]
			// ok so, if we are a function
			if(typeof prop === 'function' && prop.is_wired){
				this.attribute(key, {type:float32, wired:prop})
			}
			else if(typeof prop == 'function' || typeof prop === 'string'){
				this.monitorCompiledProperty(key, prop)
			}
			else if(typeof prop === 'boolean' && key !== 'dirty'){
				this.attribute(key, {type:boolean, value:prop})
			}
			else if(typeof prop === 'number'){
				this.attribute(key, {type:float, value:prop})
			}
			else if(prop && prop.struct && !prop.isArray){ // dont do it for 
				this.attribute(key, {type:prop.struct, value:prop})
			}
		}
		this.dirty = false

		if(!gldevice){
			return
		}
		this.shader = this.compileShader(gldevice)

		this.connectWires()
	}		

	this.useShader = function(gl, shader){
		if(shader.use) return shader.use(gl, shader, this)
		// use the shader
		gl.useProgram(shader)

		// set uniforms
		var uniset = shader.uniset
		var unilocs = shader.unilocs
		for(var key in uniset){
			var loc = unilocs[key]
			var split = loc.split
			if(split){
				for(var i = 0, prop = this; i < split.length; i ++) prop = prop[split[i]]
				if(loc.last !== prop){
					loc.last = prop
					uniset[key](gl, loc.loc, prop)
				}
			}
			else{
				var prop = this['_' + key]
				//if(this.dbg) console.log(key, prop)
				if(loc.last !== prop){
					loc.last = prop
					uniset[key](gl, loc.loc, prop)
				}
			}
		}
		// textures
		var texlocs = shader.texlocs
		var texid = 0
		for(var key in texlocs){
			var texinfo = texlocs[key]
			var split = texinfo.split
			if(split){
				for(var texture = this, i = 0; i < split.length; i ++) texture = texture[split[i]]
			}
			else{
				var texture = this['_' + texinfo.name] || this[texinfo.name]
			}
			// lets fetch the sampler
			var gltex = texture[texinfo.samplerid]
			// lets do the texture slots correct
			if(!gltex){
				gltex = texture.createGLTexture(gl, texid, texinfo)
				if(!gltex){
					gltex = this.default_texture.createGLTexture(gl, texid, texinfo)
				}
			}
			else{
				gl.activeTexture(gl.TEXTURE0 + texid)
				gl.bindTexture(gl.TEXTURE_2D, gltex)
				if(texture.updateid !== gltex.updateid){
					texture.updateGLTexture(gl, gltex)
				}
			}
			gl.uniform1i(texinfo.loc, texid)
			texid++
		}

		// set attributes
		var attrlocs = shader.attrlocs
		var len = 0 // pull the length out of the buffers
		var lastbuf
		for(var key in attrlocs){
			var attrloc = attrlocs[key]

			if(attrloc.name){
				var buf = this['_' + attrloc.name]
			}
			else{
				var buf = this['_' + key]
			}

			if(lastbuf !== buf){
				lastbuf = buf
				if(!buf.glvb) buf.glvb = gl.createBuffer()
				if(buf.length > len) len = buf.length
				gl.bindBuffer(gl.ARRAY_BUFFER, buf.glvb)
				if(!buf.clean){
					gl.bufferData(gl.ARRAY_BUFFER, buf.array.buffer, gl.STATIC_DRAW)
					buf.clean = true
				}
			}
			var loc = attrloc.loc
			gl.enableVertexAttribArray(loc)

			if(attrloc.name){ // ok so. lets set the vertexAttribPointer
				gl.vertexAttribPointer(loc, attrloc.slots, gl.FLOAT, false, buf.stride, attrloc.offset)
			}
			else{
				gl.vertexAttribPointer(loc, buf.slots, gl.FLOAT, false, buf.stride, 0)
			}
		}

		// set up blend mode
		if(this.alpha_blend_eq.op){
			var constant = this.constant
			if(constant) gl.blendColor(constant[0], constant[1], constant[2], constant.length>3?constant[3]:1)
			gl.enable(gl.BLEND)
			gl.blendEquationSeparate(this.color_blend_eq.op, this.alpha_blend_eq.op)
			gl.blendFuncSeparate(
				this.color_blend_eq.src,
				this.color_blend_eq.dst,
				this.alpha_blend_eq.src,
				this.alpha_blend_eq.dst
			)
		}
		else if(this.color_blend_eq.op){
			var constant = this.constant
			if(constant) gl.blendColor(constant[0], constant[1], constant[2], constant.length>3?constant[3]:1)
			gl.enable(gl.BLEND)
			gl.blendEquation(this.color_blend_eq.op)
			gl.blendFunc(this.color_blend_eq.src, this.color_blend_eq.dst)
		}
		else{
			gl.disable(gl.BLEND)
		}
		// set up depth test
		if(this.depth_test_eq.func){
			gl.enable(gl.DEPTH_TEST)
			gl.depthFunc(this.depth_test_eq.func)
		}
		else{
			gl.disable(gl.DEPTH_TEST)
		}
		
		return len
	}

	this.compile_use = true

	this.useShaderTemplate = function(gl, shader, root){
		// use the shader
		gl.useProgram(shader)

		// set uniforms
		SET_UNIFORMS

		// textures
		TEXTURE_START
		var texture = TEXTURE_VALUE
		// lets fetch the sampler
		var gltex = texture.TEXTURE_SAMPLER
		// lets do the texture slots correct
		if(!gltex){
			gltex = texture.createGLTexture(gl, TEXTURE_ID, TEXTURE_INFO)
		}
		else{
			gl.activeTexture(TEXTUREGL_ID) // gl.TEXTURE0 + TEXTURE_ID
			gl.bindTexture(gl.TEXTURE_2D, gltex)
			if(texture.updateid !== gltex.updateid){
				texture.updateGLTexture(gl, gltex)
			}
		}
		gl.uniform1i(TEXTURE_LOC, TEXTURE_ID)
		TEXTURE_END

		// attributes
		var len = 0 // pull the length out of the buffers
		var lastbuf
		ATTRLOC_START
		var buf = ATTRLOC_BUF
		if(lastbuf !== buf){
			lastbuf = buf
			if(!buf.glvb) buf.glvb = gl.createBuffer()
			if(buf.length > len) len = buf.length
			gl.bindBuffer(gl.ARRAY_BUFFER, buf.glvb)
			if(!buf.clean){
				gl.bufferData(gl.ARRAY_BUFFER, buf.array.buffer, gl.STATIC_DRAW)
				buf.clean = true
			}
		}
		var loc = ATTRLOC_LOC
		gl.enableVertexAttribArray(loc)
		ATTRLOC_ATTRIBPTR
		ATTRLOC_END

		// set up blend mode
		if(root.alpha_blend_eq.op){
			var constant = root.constant
			if(constant) gl.blendColor(constant[0], constant[1], constant[2], constant.length>3? constant[3]: 1)
			gl.enable(gl.BLEND)
			gl.blendEquationSeparate(root.color_blend_eq.op, root.alpha_blend_eq.op)
			gl.blendFuncSeparate(
				root.color_blend_eq.src,
				root.color_blend_eq.dst,
				root.alpha_blend_eq.src,
				root.alpha_blend_eq.dst
			)
		}
		else if(root.color_blend_eq.op){
			var constant = root.constant
			if(constant) gl.blendColor(constant[0], constant[1], constant[2], constant.length>3? constant[3]: 1)
			gl.enable(gl.BLEND)
			gl.blendEquation(root.color_blend_eq.op)
			gl.blendFunc(root.color_blend_eq.src, root.color_blend_eq.dst)
		}
		else{
			gl.disable(gl.BLEND)
		}
		
		// set up depth test
		if(root.depth_test_eq.func){
			gl.enable(gl.DEPTH_TEST)
			gl.depthFunc(root.depth_test_eq.func)
		}
		else{
			gl.disable(gl.DEPTH_TEST)
		}
		
		return len
	}

	this.compileUse = function(shader){
		// alright lets compile our useShader from 
		var tpl = this.useShaderTemplate.toString()
		// ok lets replace shit.
		// set uniforms
		var out = ''
		var uniset = shader.uniset
		var unilocs = shader.unilocs
		for(var key in uniset){
			var loc = unilocs[key]
			var split = loc.split
			if(split){
				var name = split.join('.')
				out += '\t\tvar uni = root.' + name + '\n'
			}
			else{
				out += '\t\tvar uni = root._' + key + '\n'
			}
			out += '\t\tvar loc = shader.unilocs.' + key + '\n'
			var gen = gltypes.uniform_gen[loc.type]
			//if(gen.args == 1){
			out += '\t\tif(loc.value !== uni) loc.value = uni, '
			out += 'gl.' + gen.call + '(loc.loc'
			if(gen.mat) out += ', false'
			if(gen.args == 1) out += ',uni)\n'
			if(gen.args == 2) out += ',uni[0], uni[1])\n'
			if(gen.args == 3) out += ',uni[0], uni[1], uni[2])\n'
			if(gen.args == 4) out += ',uni[0], uni[1], uni[2], uni[3])\n'
			if(gen.args === this.loguni) out += 'if(typeof uni === "number")console.log(uni)\n'
		}
		tpl = tpl.replace(/SET\_UNIFORMS/, out)

		tpl = tpl.replace(/TEXTURE\_START([\S\s]*)TEXTURE\_END/, function(m){
			var out =''
			var body = m.slice(13,-11)
			var texlocs = shader.texlocs
			var texid = 0
			for(var key in texlocs){
				var texinfo = texlocs[key]
				var split = texinfo.split

				var TEXTURE_VALUE =''
				if(split){
					TEXTURE_VALUE = 'root.' + split.join('.')
				}
				else{
					TEXTURE_VALUE = 'root.' + texinfo.name
				}

				out += body
					.replace(/TEXTURE_VALUE/, TEXTURE_VALUE)
					.replace(/TEXTURE_SAMPLER/, texinfo.samplerid)
					.replace(/TEXTURE_ID/g, texid)
					.replace(/TEXTURE_LOC/, 'shader.texlocs.' + key+ '.loc')
					.replace(/TEXTURE_INFO/, 'shader.texlocs.' + key)
					.replace(/TEXTUREGL_ID/, gltypes.gl.TEXTURE0 + texid)
			}
			return out
		})

		tpl = tpl.replace(/ATTRLOC\_START([\S\s]*)ATTRLOC\_END/, function(m){
			var body = m.slice(13,-11)
			var out = ''
			var attrlocs = shader.attrlocs
			var len = 0 // pull the length out of the buffers
			var lastbuf
			for(var key in attrlocs){
				var attrloc = attrlocs[key]
				var ATTRLOC_BUF
				if(attrloc.name){
					ATTRLOC_BUF = 'root.' + attrloc.name 
					var buf = this[attrloc.name]
				}
				else{
					ATTRLOC_BUF = 'root.' + key 
				}
				var ATTRLOC_LOC = 'shader.attrlocs.' + key +'.loc'

				if(attrloc.name){
					ATTRLOC_ATTRIBPTR = 
						'gl.vertexAttribPointer(loc, '+attrloc.slots+', gl.FLOAT, false, buf.stride, '+attrloc.offset+')'
				}
				else{
					ATTRLOC_ATTRIBPTR = 
						'gl.vertexAttribPointer(loc, buf.slots, gl.FLOAT, false, buf.stride, 0)'
				}
				out += body		
					.replace(/ATTRLOC_BUF/, ATTRLOC_BUF)
					.replace(/ATTRLOC_LOC/, ATTRLOC_LOC)
					.replace(/ATTRLOC_ATTRIBPTR/, ATTRLOC_ATTRIBPTR)
			}
			return out
		})
		
		tpl = tpl.replace(/gl.[A-Z][A-Z0-9_]+/g, function(m){
			return gltypes.gl[m.slice(3)]
		})

		shader.use = new Function('return ' + tpl)()
	}

	this.draw_type = 'TRIANGLES'//POINTS:0x0,LINES:0x1,LINE_LOOP:0x2,LINE_STRIP:0x3,TRIANGLES:0x4,TRIANGLE_STRIP:0x5,TRIANGLE_FAN:0x6
	
	// lets draw ourselves
	this.draw = function(gldevice, start, end){
		if(this.color === undefined) return
		//if(this.mydbg) debugger
		if(!this.hasOwnProperty('shader') || !this.shader) this.compile(gldevice)
		var gl = gldevice.gl
		var len = this.useShader(gl, this.shader)
		// draw
		gl.drawArrays(gl[this.draw_type], start || 0, end === undefined?len: end)
	}

	this.drawGuid = function(gldevice, start, end){
		if(this.color === undefined) return
		//if(this.mydbg) debugger

		if(!this.hasOwnProperty('shader') || !this.shader) this.compile(gldevice)
		if (!this.shader.guid) return;
		var gl = gldevice.gl
		var len = this.useShader(gl, this.shader.guid)
		// draw
		gl.drawArrays(gl[this.draw_type], start || 0, end === undefined?len: end)
	}

	this.drawDebug = function(gldevice, start, end){
		if(this.color === undefined) return
		if(!this.hasOwnProperty('shader') || !this.shader) this.compile(gldevice)
		if(!this.shader || !this.shader.debug) return
		var gl = gldevice.gl
		var len = this.useShader(gl, this.shader.debug)
		// draw
		gl.drawArrays(gl[this.draw_type], start || 0, end === undefined?len: end)
		return this.debug_type
	}

	// draw a root node
	this.renderTo = function(nest){
	}

	this.atExtend = function(){
		if(this !== self) this.compile()
	}
})