/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class( function(node, require){
	var Animate = require('$base/animate')
	var FlexLayout = require('$lib/layout')
	var Shader = this.Shader = require('$draw/$drawmode/shader$drawmode')

	this.attributes = {
		pos: {type:vec2, value:vec2(0,0)},
		x: {storage:'pos', index:0},
		y: {storage:'pos', index:1},

		left: {storage:'pos', index:0},
		top: {storage:'pos', index:1},
		corner: {type:vec2, value:vec2(NaN, NaN)},
		right: {storage:'corner', index:0},
		bottom: {storage:'corner',index:1},

		bgcolor: {type:vec4, value: vec4(0,0,0.1,1)},
		clearcolor: {type:vec4, value: vec4('transparent')},

		size: {type:vec2, value:vec2(NaN, NaN)},

		overflow: {type: Enum('','hidden','scroll','auto'), value:''},

		w: {storage:'size', index:0},
		h: {storage:'size', index:1},
		width: {storage:'size', index:0},
		height: {storage:'size', index:1},


		min: {type: vec2, value:vec2(NaN, NaN)},
		max: {type: vec2, value:vec2(NaN, NaN)},

		margin: {type: vec4, value: vec4(0,0,0,0)},
		marginleft: {storage:'margin', index:0},
		margintop: {storage:'margin', index:1},
		marginright: {storage:'margin', index:2},
		marginbottom: {storage:'margin', index:3},

		padding: {type: vec4, value: vec4(0,0,0,0)},
		paddingleft: {storage:'padding', index:0},
		paddingtop: {storage:'padding', index:1},
		paddingright: {storage:'padding', index:2},
		paddingbottom: {storage:'padding', index:3},

		scale: {type: vec3, value: vec3(1)},
		anchor: {type: vec3, value: vec3(0)},
		rotate: {type: vec3, value: vec3(0)},
		translate: {type: vec3, value: vec3(0)},

		bordercolor: {type: vec4, value: vec4(0,0,0,0)},

		borderwidth: {type: vec4, value: vec4(0,0,0,0)},
		borderradius: {type: vec4, value: vec4(0,0,0,0)},
		borderleftwidth: {storage:'borderwidth', index:0},
		bordertopwidth: {storage:'borderwidth', index:1},
		borderrightwidth: {storage:'borderwidth', index:2},
		borderbottomwidth: {storage:'borderwidth', index:3},

		flex: {type: float, value: NaN},

		flexwrap: {type: String, value: "wrap"},	//'wrap', 'nowrap'
		flexdirection: {type: String, value: "row"},	//'column', 'row'
		justifycontent: {type: String, value: ""}, //	'flex-start', 'center', 'flex-end', 'space-between', 'space-around'
		alignitems: {type: String, value:"stretch"},  // 	'flex-start', 'center', 'flex-end', 'stretch'
		alignself: {type: String, value:"stretch"},  // 	'flex-start', 'center', 'flex-end', 'stretch'
		position: {type: String, value: "relative" },	//'relative', 'absolute'

		mode: {type:Enum('','2D','3D'), value:''},
		
		model: {type: Object},
		
		visible: {type:boolean, value: true},
		fov: {type:float, value: 45},
		nearplane: {type:float, value: 0.001},
		farplane: {type:float, value: 1000},
		
		camera: {type: vec3, value: vec3(-2,2,-2)},
		lookat: {type: vec3, value: vec3(0)},
		up: {type: vec3, value: vec3(0,-1,0)}	
	}

	
	this.camera = this.lookat = this.up = function(){this.redraw();};
	
	this.persists = ['model']

	this.events = [
		"click","dblclick","miss",
		"mouseout","mouseover","mousemove",
		"mouseleftdown","mouseleftup",
		"mouserightdown","mouserightup",
		"mousewheelx","mousewheely",
		"keyup","keydown","keypress","keypaste",
		"focusget","focuslost",
		"postLayout"
	]

	this.modelmatrix = mat4.identity()
	this.totalmatrix = mat4.identity()
	this.viewmatrix = mat4.identity()
	this.layermatrix = mat4.identity()
	this.normalmatrix = mat4.identity()
	
	this.layout = {width:0, height:0, left:0, top:0, right:0, bottom:0}
	this.device = {frame:{size:vec2()}}

	this.rpcproxy = false	

	// lets make a nested class
	define.class(this, 'scrollbar', require('$classes/scrollbar'),function(){
	})

	// automatically switch to the rounded shader
	this.borderradius = function(value){
		if(typeof value === 'number' && value !== 0 || value[0] !== 0 || value[1] !== 0 || value[2] !== 0 || value[3] !== 0){
			// this switches the bg shader to the rounded one
			this.bg = this.rounded
		}
		else this.bg = this.rect
	}

	// turn on the border shader
	this.borderwidth = function(value){
		if(typeof value === 'number' && value !== 0 || value[0] !== 0 || value[1] !== 0 || value[2] !== 0 || value[3] !== 0){
			// turn it on by assigning an order number
			this.border = 2
		}
		else this.border = false
	}

	this.mode = function(value){
		if(value === '3D'){
			this.bg = null
			this.border = null
		}
	}

	this.localMouse = function(){
		return vec2(this.screen.remapMouse(this))
	}

	this.init = function(){
		this.anims = {}
		this.layout = {width:0, height:0, left:0, top:0, right:0, bottom:0}
		this.shader_list = []
		this.modelmatrix = mat4()
		this.totalmatrix = mat4.identity()
		this.layermatrix = mat4()
		this.atInit()
	}

	this.atInit = function(){
		for(var key in this.shader_order){
			var order = this.shader_order[key]
			if(!order && !isNaN(order)) continue
			var shader = this[key]
			if(shader){
				var shobj = this[key + 'shader'] = new shader(this)
				shobj.shadername = key
				shobj.order = order
				this.shader_list.push(shobj)
			}
		}
		this.shader_list = this.shader_list.sort(function(a, b){
			return this.shader_order[a.shadername] > this.shader_order[b.shadername]
		}.bind(this))

		if(this.debug !== undefined && this.debug.indexOf('shaderlist') !== -1){
			console.log(this.shader_order)
		}

		if(this._mode){
			// give it a blendshader
			this.blendshader = new this.blend(this)
		}
	}

	this.atRender = function(){
		// lets modify this.children
		//if(this._overflow === ')
		//this.children.push()
	}

	this.atDraw = function(){
		if(this.debug !== undefined && this.debug.indexOf('atdraw')!== -1) console.log(this)
	}

	// make sure our shader_list is in sync
	this.syncShaderList = function(){

	}

	this.shaderOrder = function(key, value){
		if(!this.hasOwnProperty('shaders')) this.shader_order = Object.create(this.shader_order || {})
		// the first time is always false
		if(this.shader_order[key] === undefined){
			this.shader_order[key] = false
			return
		}
		this.shader_order[key] = value
	}

	// custom hook in the inner class assignment to handle nested shaders specifically
	this.atInnerClassAssign = function(key, value){

		// set the shader order

		if(!value || typeof value === 'number' || typeof value === 'boolean'){
			return this.shaderOrder(key, value)
		}

		// its a shader redirect
		if(typeof value === 'string'){
			this[key] = this[value]
			var order = this.shader_order[key]
			if(typeof order !== 'number') this.shaderOrder(key, 1)
			return
		}

		// its a class assignment
		if(typeof value === 'function' && Object.getPrototypeOf(value.prototype) !== Object.prototype){
			this['_' + key] = value
			if(value.prototype instanceof Shader){
				this.shaderOrder(key, 1)
			}
			return
		}

		// its inheritance
		var cls = this['_' + key]
		this['_' + key] = cls.extend(value, this)

		// check if we need to turn it on
		if(cls.prototype instanceof Shader){
			var order = this.shader_order[key]
			if(order !== null && typeof order !== 'number'){
				this.shaderOrder(key, 1)
			}
		}
	}

	// redraw our view
	this.redraw = function(){
		if(this.device && this.device.redraw) this.device.redraw()
	}

	// when do we call this?..
	this.updateShaders = function(){
		// lets call update on our shaders
		var shadername
		// we can wire up the shader 
		if(!this._shaderswired){
			this.atAttributeGet = function(attrname){
				// monitor attribute wires for geometry
			}.bind(this)
		}
		var shaders = this.shader_list
		if(!shaders) debugger
	
		for(var i = 0; i < shaders.length; i ++){
			var shader = shaders[i]			
			if(shader.update) shader.update()
		}		
	
		if(!this._shaderswired) {
			this._shaderswired = true
			this.atAttributeGet = undefined
		}
	}

	this.updateMatrices = function(parentmatrix, parentmode){
		
		if (this._mode && this._mode != parentmode ){
			//console.log("modeswitch:", this._mode);
			parentmatrix = mat4.identity();
			this.modelmatrix = mat4.identity();
			parentmode = this._mode;
		}
		if (parentmode== '3D' && !this._mode ){	
			mat4.TSRT2(this.anchor, this.scale, this.rotate, this.translate, this.modelmatrix);
			//mat4.debug(this.modelmatrix);
		}
		else {
			// compute TSRT matrix
			if(this.layout){
				var s = this._scale
				var r = this._rotate
				var t0 = this.layout.left, t1 = this.layout.top, t2 = 0
				if (this._position === "absolute"){
					t0 = this._pos[0]
					t1 = this._pos[1]
				}
				var hw = (  this.layout.width !== undefined ? this.layout.width: this._size[0] ) / 2
				var hh = ( this.layout.height !== undefined ? this.layout.height: this._size[1]) / 2
				mat4.TSRT(-hw, -hh, 0, s[0], s[1], s[2], r[0], r[1], r[2], t0 + hw * s[0], t1 + hh * s[1], t2, this.modelmatrix);
			}
			else {
				var s = this._scale
				var r = this._rotate
				var t = this._translate
				var hw = this._size[0] / 2
				var hh = this._size[1] / 2
				mat4.TSRT(-hw, -hh, 0, s[0], s[1], s[2], 0, 0, r[2], t[0] + hw * s[0], t[1] + hh * s[1], t[2], this.modelmatrix);
			}
		}

		// do the matrix mul
		if(this._mode){
			//mat4.identity(this.totalmatrix)
			//this.layermatrix = mat4.identity()
			if(parentmatrix) mat4.mat4_mul_mat4(parentmatrix, this.modelmatrix, this.layermatrix)
			else this.layermatrix = this.modelmatrix
		}
		else{
			if(parentmatrix) mat4.mat4_mul_mat4(parentmatrix, this.modelmatrix, this.totalmatrix)
		}

		var children = this.children
		if(children) for(var i = 0; i < children.length; i++){
			var child = children[i]
			if(child._mode) continue // it will get its own pass
			child.updateMatrices(this.totalmatrix, parentmode)
		}
	}

	this.doLayout = function(width, height){
		if(!isNaN(this._flex)){ // means we need to set our layout from external
			var layout = this.layout
			var flex = this._flex
			var size = this._size
			this._flex = 1
			// we have to have unbounded 
			this._size = vec2(NaN,NaN)//Math.ceil(this.layout.width + this.layout.right), Math.ceil(this.layout.height+ this.layout.bottom))
		}

		var copynodes = FlexLayout.fillNodes(this)
		var layouted = FlexLayout.computeLayout(copynodes)

		if(layout){
			this.computedsize = this.layout
			this._flex = flex
			this._size = size
			this.layout = layout
		}
		this.updateMatrices(this.parent?this.parent.totalmatrix:undefined, this._mode)

	}

	this.update = this.updateShaders

	this.startAnimation = function(key, value, track, resolve){
		if(this.screen) this.screen.startAnimationRoot(this, key, value, track, resolve)
		else{
			this['_' + key] = value
		}
	}

	// ok so the problem is, the init has already overloaded the class that auto-switches
	// so what do we do with that. 
	// thats a real problem

	// standard bg is undecided
	define.class(this, 'bg', this.Shader, function(){})

	define.class(this, 'rect', this.Shader, function(){
		this.mesh = vec2.array()
		this.mesh.pushQuad(0,0,1,0,0,1,1,1)
		this.position = function(){
			uv = mesh.xy
			pos = vec2(mesh.x * view.layout.width, mesh.y * view.layout.height)
			return vec4(pos, 0, 1) * view.totalmatrix * view.viewmatrix
		}
		this.color = function(){
			return view.bgcolor
		}
	})

	// make rect the default bg shader
	this.bg = this.rect

	// rounded rect shader class
	define.class(this, 'rounded', this.Shader, function(){

		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,
			uv:vec2
		})

		this.mesh = this.vertexstruct.array()
	
		this.depth_test = ""

		// matrix and viewmatrix should be referenced on view
		this.opacity = 0.0
		this.draw_type = "TRIANGLE_FAN"
		this.color_blend = 'src_alpha * src_color + (1 - src_alpha) * dst_color'
  
		this.update = function(){

			var view = this.view
			var width = view.layout?view.layout.width:view.width
			var height = view.layout?view.layout.height:view.height
			var radius = view.borderradius

			var mesh = this.mesh = this.vertexstruct.array()

			if (vec4.equals(radius, vec4(0,0,0,0))) {
				mesh.push([width/2,height/2], 0, [1,0,0,0], 0.5,0.5)
				mesh.push([0,0], 0, [1,0,0,0], 0,0)
				mesh.push([width,0], 0, [1,0,0,0], 1,0)
				mesh.push([width,height], 0, [1,0,0,0], 1,1)
				mesh.push([0,height], 0, [1,0,0,0], 0,1)
				mesh.push([0,0], 0, [1,0,0,0], 0,0)
			}
			else{
				
				var divbase = 0.15;
				var pidiv1 = Math.floor(Math.max(2, divbase* PI * radius[0]))
				var pidiv2 = Math.floor(Math.max(2, divbase* PI * radius[1]))
				var pidiv3 = Math.floor(Math.max(2, divbase* PI * radius[2]))
				var pidiv4 = Math.floor(Math.max(2, divbase* PI * radius[3]))
				
				var pimul1 = (PI*0.5)/(pidiv1-1)
				var pimul2 = (PI*0.5)/(pidiv2-1)
				var pimul3 = (PI*0.5)/(pidiv3-1)
				var pimul4 = (PI*0.5)/(pidiv4-1)

				this.mesh.push([width/2,height/2], 0, [0,0,0,0], 0.5,0.5)

				for(var p = 0;p<pidiv1;p++) this.mesh.push(vec2(radius[0] ,radius[0]), p*pimul1, vec4(1,0,0,0), 1,0)	
				for(var p = 0;p<pidiv2;p++) this.mesh.push(vec2(width - radius[1]-1, radius[1]), p*pimul2 + PI/2, vec4(0,1,0,0), 1,0)
				for(var p = 0;p<pidiv3;p++) this.mesh.push(vec2(width - radius[2]-1, height - radius[2]-1), p*pimul3+ PI, vec4(0,0,1,0), 1,1)
				for(var p = 0;p<pidiv4;p++) this.mesh.push(vec2(radius[3], height - radius[3]-1), p*pimul4 + PI + PI/2, vec4(0,0,0,1), 0,1)
				
				this.mesh.push(vec2( radius[0] ,radius[0]), 0, vec4(1,0,0,0), 1,0)
			}	
		}

		this.color = function(){
			return view.bgcolor
		}

		this.position = function(){
			pos = mesh.pos.xy
			var ca = cos(mesh.angle + PI)
			var sa = sin(mesh.angle + PI)
			
			var rad  = (mesh.radmult.x * view.borderradius.x + mesh.radmult.y * view.borderradius.y + mesh.radmult.z * view.borderradius.z + mesh.radmult.w * view.borderradius.w)
			pos.x += ca * rad
			pos.y += sa * rad
			
			uv = vec2(pos.x/view.layout.width,  pos.y/view.layout.height)
			
			sized = vec2(pos.x, pos.y)
			return vec4(sized.x, sized.y, 0, 1) * view.totalmatrix * view.viewmatrix
		}
	})

	// the blending shader
	define.class(this, 'blend', this.Shader, function(){
		this.omit_from_shader_list = true
		this.texture = Shader.prototype.Texture.fromType('rgba_depth_stencil')
		this.mesh = vec2.array()
		this.mesh.pushQuad(0,0, 0,1, 1,0, 1,1)
		this.width = 0
		this.height = 0

		this.color = function(){
			return texture.sample(mesh.xy+vec2(0))
		}

		this.position = function(){
			return vec4( mesh.x * width, mesh.y * height, 0, 1) * view.layermatrix * view.viewmatrix
		}
	})
	this.blend = null
	
	// rounded corner border shader
	define.class(this, 'border', this.Shader, function(){
		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,			
			uv:vec2
		})
		this.mesh = this.vertexstruct.array()

		this.draw_type = "TRIANGLE_STRIP"
		
		this.update = function(){

			var view = this.view
			var width = view.layout? view.layout.width: view.width
			var height = view.layout? view.layout.height: view.height
			var radius = view.borderradius

			var mesh = this.mesh = this.vertexstruct.array()
						
			var borderradius = view.borderradius
			var borderwidth = view.borderwidth
			
			var scale0 = ((borderradius[0]-borderwidth[0]))/Math.max(0.01, borderradius[0])
			var scale1 = ((borderradius[1]-borderwidth[0]))/Math.max(0.01, borderradius[1])
			var scale2 = ((borderradius[2]-borderwidth[0]))/Math.max(0.01, borderradius[2])
			var scale3 = ((borderradius[3]-borderwidth[0]))/Math.max(0.01, borderradius[3])
			
			var pidiv = 20
			
			var divbase = 0.15
			var pidiv1 = Math.floor(Math.max(2, divbase* PI * radius[0]))
			var pidiv2 = Math.floor(Math.max(2, divbase* PI * radius[1]))
			var pidiv3 = Math.floor(Math.max(2, divbase* PI * radius[2]))
			var pidiv4 = Math.floor(Math.max(2, divbase* PI * radius[3]))
			
			var pimul1 = (PI*0.5)/(pidiv1-1)
			var pimul2 = (PI*0.5)/(pidiv2-1)
			var pimul3 = (PI*0.5)/(pidiv3-1)
			var pimul4 = (PI*0.5)/(pidiv4-1)

			for(var p = 0; p < pidiv1; p ++){
				this.mesh.push(vec2( borderradius[0] ,borderradius[0]), p*pimul1, vec4(1,0,0,0), 1,0);
				this.mesh.push(vec2( borderradius[0] ,borderradius[0]), p*pimul1, vec4(scale0,0,0,0), 1,0);
			}
			
			for(var p = 0;p<pidiv2;p++){
				this.mesh.push(vec2(width-borderradius[1],borderradius[1]), p*pimul2 + PI/2, vec4(0,1,0,0), 1,0);
				this.mesh.push(vec2(width-borderradius[1],borderradius[1]), p*pimul2 + PI/2, vec4(0,scale1,0,0), 1,0);
			}
			for(var p = 0;p<pidiv3;p++){
				this.mesh.push(vec2(width-borderradius[2],height-borderradius[2]), p*pimul3 + PI, vec4(0,0,1,0), 1,1);
				this.mesh.push(vec2(width-borderradius[2],height-borderradius[2]), p*pimul3 + PI, vec4(0,0,scale2,0), 1,1);
			}
			for(var p = 0;p<pidiv4;p++){
				this.mesh.push(vec2(borderradius[3],height-borderradius[3]), p*pimul4 + PI + PI/2, vec4(0,0,0,1), 0,1);
				this.mesh.push(vec2(borderradius[3],height-borderradius[3]), p*pimul4 + PI + PI/2, vec4(0,0,0,scale3), 0,1);
			}				
			this.mesh.push(vec2( borderradius[0] ,borderradius[0]), 0, vec4(1,0,0,0), 1,0);
			this.mesh.push(vec2( borderradius[0] ,borderradius[0]), 0, vec4(scale0,0,0,0), 1,0);
		
		}
		
		this.color = function(){
			return view.bordercolor
		}
		
		this.position = function(){
			
			pos = mesh.pos.xy
			var ca = cos(mesh.angle + PI)
			var sa = sin(mesh.angle+PI)
			
			var rad  = dot(mesh.radmult, view.borderradius)
			
			pos.x += ca * rad
			pos.y += sa * rad
			
			uv = vec2(pos.x/view.width,  pos.y/view.height)
			
			sized = vec2(pos.x, pos.y)
			return vec4(sized.x, sized.y, 0, 1) * view.totalmatrix * view.viewmatrix
		}
	})
	this.border = false

})