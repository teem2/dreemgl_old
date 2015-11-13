/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
// Sprite class

define.class('./view_base', function(require, exports){

	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLText = require('$gl/gltext')
	var ViewGL = exports

	this.dump = 1
	this.matrixdirty = true;
	this.dirty = true
	this.threedee = false;
	this.texturecache = false
	
	this.init = function(previous){
		

		this.bg_shader = new this.bg()
		this.border_shader = new this.border()			
		this.fg_shader = new this.fg()

		this.orientation = {
			rotation : vec3(0, 0, 0), // (or {0,0,0} for 3d rotation)
			translation : vec3(this.x != undefined? this.x: 0, this.y != undefined? this.y: 0, 0),
			scale : vec3(1, 1, 1),
			matrix : mat4.identity(), // calculated
			worldmatrix : mat4.identity() // calculated
		};
		
		this.texturecache = function(){
			//console.log("setting texturecaching: ", this.texturecache);
			this.enableTextureCache(this.texturecache);
		}

		this.visible = true
		this.backgroundTexture = false;
		this.texturecache = false;
		this.effectiveopacity = this.opacity;

		// if we have a bgimage, we have to set our bgimage function to something
		if(this.bgimage){
			// lets make the thing fetch a texture
			this.bg_shader.texture = new GLTexture()
			
			if(this.bg_shader.bgcolorfn === this.plaincolor){
				this.bg_shader.bgcolorfn = function(pos, dist){
					//var aspect = texture.size.y / texture.size.x
					//var center = (1. - aspect) * .5
					//var sam = vec2(pos.x * aspect + center, pos.y)
					var col = texture.sample(pos)
					//if(sam.x< 0. || sam.x > 1.) col.a = 0.
					return col
				}
			}

			var imgload = function(result){
				this.bg_shader.texture = GLTexture.fromImage(result)
				if(isNaN(this.width)) this.width = this.bg_shader.texture.size[0]
				if(isNaN(this.height)) this.height = this.bg_shader.texture.size[1]
				this.reLayout()
				this.setDirty(true)
			}.bind(this)

			if(typeof this.bgimage === 'string')
				require.async(this.bgimage).then(imgload)
			else
				imgload(this.bgimage)
		}

		if (this.hasListeners('click') || this.hasListeners('mouseleftdown') || 
			this.hasListeners('mouseout') ||  this.hasListeners('mouseover')|| 
			this.hasListeners('mouseup') || this.hasListeners('mousemove') ||
			this.hasListeners('mousewheelx') || this.hasListeners('mousewheely')){
			this.has_mouse_interaction = true
		}
		else{			
			this.has_mouse_interaction = false
		}

		this.screen.addDirtyNode(this);
		if(!this.mode && this.parent) this.mode = this.parent.mode

		if(this.mode === undefined || this.mode === 'GL'){
			this.drawContent = this.drawContentGL
		}
		else if(this.mode === 'DOM'){
			this.drawContent = this.drawContentDOM
		}
		else if(this.mode === 'Dali'){
			this.drawContent = this.drawContentDali
		}

		this.interfaceguid = this.screen.allocGuid(this);
		if (this.preDraw) this.screen.registerPredraw(this);
		if (this.postDraw) this.screen.registerPostdraw(this);

		this.effectiveguid = this.interfaceguid;
	}

	// dirty event hook
	this.clipping =
	this.bordercolor =
	this.bgcolor =
	this.cornerradius =
	this.borderwidth =
	this.height =
	this.width =
	this.texturecache = 
	this.opacity = function(){
		this.setDirty(true)
	}

	this.plaincolor = function(pos, dist){
		return bgcolor
	}

	define.class(this, 'border', GLShader, function(){
		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,			
			uv:vec2
		})
		
		this.matrix = mat4.identity()
		this.viewmatrix = mat4.identity()
		this.mesh = this.vertexstruct.array();
		this.radius = vec4(0.0);
		this.width = 0.0;
		this.height = 0.0;
		this.bordercolor = vec4("black");
		this.borderwidth = 0.0;
		this.has_guid = true
		this.geomradius = vec4(0);
		this.geomwidth = 0;
		this.geomheight =0;
		this.geomborder = 0;
		this.draw_type ="TRIANGLE_STRIP";
		this.setupBorder = function(width, height, radius, borderwidth){	
			//console.log(width, height, radius, borderwidth);
			this._width = width;
			this._height = height;		
			if (borderwidth != this.geomborder || this.geomheight != height || this.geomwidth != width || vec4.equals(radius, 	this.geomradius) == false){
				
				this.geomborder  = borderwidth;
				this._radius = radius;
				this._borderwidth = borderwidth;
				this.buildGeometry(width, height);
				this.geomradius = radius;
				this.geomheight = height;
				this.geomwidth = width;
			}
		}
		
		this.buildGeometry = function(width, height){
			
			//this.mesh.clear();
			this.mesh = this.vertexstruct.array();
			
			var scale0 = (Math.max(0, this._radius[0]-this._borderwidth[0]))/this._radius[0];
			var scale1 = (Math.max(0, this._radius[1]-this._borderwidth[0]))/this._radius[1];
			var scale2 = (Math.max(0, this._radius[2]-this._borderwidth[0]))/this._radius[2];
			var scale3 = (Math.max(0, this._radius[3]-this._borderwidth[0]))/this._radius[3];
			
			var pidiv = 20;
				
			for(var p = 0; p < PI / 2; p += PI / pidiv){
				this.mesh.push(vec2( this._radius[0] ,this._radius[0]), p, vec4(1,0,0,0), 1,0);
				this.mesh.push(vec2( this._radius[0] ,this._radius[0]), p, vec4(scale0,0,0,0), 1,0);
			}
			
			for(var p = 0;p<PI/2;p+= PI/pidiv){
				this.mesh.push(vec2(width-this._radius[1],this._radius[1]), p + PI/2, vec4(0,1,0,0), 1,0);
				this.mesh.push(vec2(width-this._radius[1],this._radius[1]), p + PI/2, vec4(0,scale1,0,0), 1,0);
			}
			for(var p = 0;p<PI/2;p+= PI/pidiv){
				this.mesh.push(vec2(width-this._radius[2],height-this._radius[2]), p + PI, vec4(0,0,1,0), 1,1);
				this.mesh.push(vec2(width-this._radius[2],height-this._radius[2]), p + PI, vec4(0,0,scale2,0), 1,1);
			}
			for(var p = 0;p<PI/2;p+= PI/pidiv){
				this.mesh.push(vec2(this._radius[3],height-this._radius[3]), p + PI + PI/2, vec4(0,0,0,1), 0,1);
				this.mesh.push(vec2(this._radius[3],height-this._radius[3]), p + PI + PI/2, vec4(0,0,0,scale3), 0,1);
			}				
			this.mesh.push(vec2( this._radius[0] ,this._radius[0]), 0, vec4(1,0,0,0), 1,0);
			this.mesh.push(vec2( this._radius[0] ,this._radius[0]), 0, vec4(scale0,0,0,0), 1,0);
		
		}
		this.color = function(){return bordercolor;};
		this.position = function(){
			var pos = mesh.pos.xy;
			var ca = cos(mesh.angle + PI);
			var sa = sin(mesh.angle+PI);
			
			var rad  = dot(mesh.radmult, radius);
			pos.x += ca * rad;
			pos.y += sa * rad;
			
			uv = vec2(pos.x/width,  pos.y/height);
			
			sized = vec2(pos.x, pos.y)
			return vec4(sized.x, sized.y, 0, 1) * matrix * viewmatrix
		}
		
		
		
	})
	define.class(this, 'bg', GLShader, function(){

		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,
			uv:vec2
		})

		this.has_guid = true
		this.depth_test = "";
		this.texture = new GLTexture()

		this.mesh = this.vertexstruct.array();
		
		this.bgcolor = vec4(1)
		
		this.bordercolor = vec4(0, 0, 0, 0)
		this.borderwidth = 0.0,
		
		this.width = 0.0;
		this.height = 0.0;
		this.geomwidth =0 ;
		this.geomheight =0 ;
		this.geomradius = vec4(0,0,0,0);
		this.draw_type ="TRIANGLE_FAN";
		this.setupSize = function(width, height, radius){	
			this._width = width;
			this._height = height;		
			if (this.geomheight != height || this.geomwidth != width || vec4.equals(radius, this.geomradius) == false){
				
				this._radius = radius;
				this.buildGeometry(width, height);
				this.geomradius = radius;
				this.geomheight = height;
				this.geomwidth = width;
			}
		}
		
		this.buildGeometry = function(width, height){
			
			//this.mesh.clear();
			this.mesh = this.vertexstruct.array();
			if (vec4.equals(this._radius, vec4(0,0,0,0))) {
				this.mesh.push(vec2(width/2,height/2), 0, vec4(1,0,0,0), 0.5,0.5);
				this.mesh.push(vec2(0,0), 0, vec4(1,0,0,0), 0,0);
				this.mesh.push(vec2(width,0), 0, vec4(1,0,0,0), 1,0);
				this.mesh.push(vec2(width,height), 0, vec4(1,0,0,0), 1,1);
				this.mesh.push(vec2(0,height), 0, vec4(1,0,0,0), 0,1);
				this.mesh.push(vec2(0,0), 0, vec4(1,0,0,0), 0,0);
			}
			else{
				var pidiv = 10;
				this.mesh.push(vec2(width/2,height/2), 0, vec4(0,0,0,0), 0.5,0.5);
				
				for(var p = 0;p<PI/2;p+= PI/pidiv) this.mesh.push(vec2( this._radius[0] ,this._radius[0]), p, vec4(1,0,0,0), 1,0);			
				for(var p = 0;p<PI/2;p+= PI/pidiv) this.mesh.push(vec2(width-this._radius[1],this._radius[1]), p + PI/2, vec4(0,1,0,0), 1,0);
				for(var p = 0;p<PI/2;p+= PI/pidiv) this.mesh.push(vec2(width-this._radius[2],height-this._radius[2]), p + PI, vec4(0,0,1,0), 1,1);
				for(var p = 0;p<PI/2;p+= PI/pidiv) this.mesh.push(vec2(this._radius[3],height-this._radius[3]), p + PI + PI/2, vec4(0,0,0,1), 0,1);
				
				this.mesh.push(vec2( this._radius[0] ,this._radius[0]), 0, vec4(1,0,0,0), 1,0);
				//this.mesh.push(vec2(0,0), 0, vec4(1,0,0,0), 1,0);
				
			}
			
		}
		
		this.radius = vec4(4, 14, 4, 14)
		//this.dump = 1
		this.matrix = mat4.identity()
		this.viewmatrix = mat4.identity()
		this.opacity = 0.0;
		this.time = 0.1

		this.bgcolorfn = ViewGL.prototype.plaincolor 

		this.color = function(){
			var bgcolor =  bgcolorfn(uv.xy, 0)
			
			
			
			return bgcolor;
		}

		this.color_blend = 'src_alpha * src_color + (1 - src_alpha) * dst_color'
		//this.color_blend = 'src_alpha * src_color + dst_color'
		this.position = function(){
			var pos = mesh.pos.xy;
			var ca = cos(mesh.angle + PI);
			var sa = sin(mesh.angle + PI);
			
			var rad  = (mesh.radmult.x * radius.x + mesh.radmult.y * radius.y + mesh.radmult.z * radius.z + mesh.radmult.w * radius.w) ;;
			pos.x += ca * rad;
			pos.y += sa * rad;
			
			uv = vec2(pos.x/width,  pos.y/height);
			
			sized = vec2(pos.x, pos.y)
			return vec4(sized.x, sized.y, 0, 1) * matrix * viewmatrix
		}
	})
	
	define.class(this, 'fg', GLText, function(){
	})
		
	this.enableTextureCache = function(enabled){
		if (enabled == false){
			if(this.texturecache != false){
				// destroy texturecache
				this.texturecache = false;
				this.setDirty(true)
			}
		}
		else{
			if(this.texturecache == false){ // only build if it doesn't already have a texture cache
				this.texturecache = {
					textureID: 0
				};
				this.setDirty(true)
			}
		}
	}
	
	this.getWorldMatrix = function(){
		
		if (this.matrixdirty || this.hasLayoutChanged()){
			if (this.parent && this.parent.matrixdirty || (this.parent.hasLayoutChanged && this.parent.hasLayoutChanged())) {
					if (parent.recomputeMatrix) parent.recomputeMatrix();
			}
			this.recomputeMatrix();
			this.orientation.worldmatrix = mat4.mul(this.orientation.matrix, this.parent.orientation.worldmatrix);
		}	
		return this.orientation.worldmatrix;
	}
	
	this.getInvertedMatrix = function(){
		if (this.matrixdirty || this.hasLayoutChanged()){
			this.recomputeMatrix();
			this.orientation.worldmatrix = mat4.mul(this.orientation.matrix, this.parent.orientation.worldmatrix);
		}
		if (this.orientation.invertedworldmatrix === undefined){
			this.orientation.invertedworldmatrix = mat4.invert(this.orientation.worldmatrix)
		}
		//mat4.debug(this.orientation.invertedworldmatrix);
		return this.orientation.invertedworldmatrix;
	}
	
	this.boundingRectCache = undefined;

	this.lastdrawnboundingrect = {left:0, right: 0, top:0, bottom:0};

	this.getLastDrawnBoundingRect = function(){
		return this.lastdrawnboundingrect;
	}
	
	this.getBoundingRect = function(force){	
		if (!this.boundingRectCache || force === true){
			this.boundingRectCache = this.calculateBoundingRect(force);
		}
		return this.boundingRectCache;
	}

	this.getUnclippedBoundingRect = function(comp){
		if(!comp){
			var init = true
			comp = {
				left: this.layout.left, 
				top: this.layout.top, 
				right: this.layout.right, 
				bottom: this.layout.bottom
			}
		}
		else{
			if(this.layout.left < comp.left) comp.left = this.layout.left
			if(this.layout.top < comp.top) comp.top = this.layout.top
			if(this.layout.left + this.layout.width > comp.right) comp.right = this.layout.left + this.layout.width
			if(this.layout.top + this.layout.height > comp.bottom) comp.bottom = this.layout.top + this.layout.height
		}
		if(this.children) for(var i = 0; i < this.children.length; i++){
			this.children[i].getUnclippedBoundingRect(comp)
		}
		if(init){
			comp.width = comp.right - comp.left
			comp.height = comp.bottom - comp.top
		}
		return comp
	}
	
	var rectv1 = vec2(), rectv2 = vec2(), rectv3 = vec2(), rectv4 = vec2();

	this.calculateBoundingRect = function(force){	
		if (!this.orientation){
			debugger
			return {left:0, right:0, top:0, bottom:0}
		}
		if (this.matrixdirty || force === true){
			this.recomputeMatrix()
		}

		var x1 = 0
		var x2 = this._size[0]
		var y1 = 0
		var y2 = this._size[1]

		if(this.layout){
			x2 = this.layout.width
			y2 = this.layout.height
		}

		var v1 = rectv1
		var v2 = rectv2
		var v3 = rectv3
		var v4 = rectv4
		v1[0] = x1, v1[1] = y1
		v2[0] = x2, v2[1] = y1
		v3[0] = x2, v3[1] = y2
		v4[0] = x1, v4[1] = y2
		
		vec2.mul_mat4_t(v1, this.orientation.worldmatrix,v1)
		vec2.mul_mat4_t(v2, this.orientation.worldmatrix,v2)
		vec2.mul_mat4_t(v3, this.orientation.worldmatrix,v3)
		vec2.mul_mat4_t(v4, this.orientation.worldmatrix,v4)		
		//mat4.debug(this.orientation.worldmatrix,true);
		//mat4.debug(this.orientation.matrix,true);
		var minx = v1[0]
		var miny = v1[1]
		var maxx = v1[0]
		var maxy = v1[1]
		if (v2[0] < minx) minx = v2[0];else if (v2[0] > maxx) maxx = v2[0]
		if (v3[0] < minx) minx = v3[0];else if (v3[0] > maxx) maxx = v3[0]
		if (v4[0] < minx) minx = v4[0];else if (v4[0] > maxx) maxx = v4[0]
		
		if (v2[1] < miny) miny = v2[1];else if (v2[1] > maxy) maxy = v2[1]
		if (v3[1] < miny) miny = v3[1];else if (v3[1] > maxy) maxy = v3[1]
		if (v4[1] < miny) miny = v4[1];else if (v4[1] > maxy) maxy = v4[1]
		
		var ret = {left: minx, top: miny, right: maxx, bottom: maxy}

		return ret
	}
	
	
	this.recomputeMatrix = function(){
		
		var o = this.orientation
		if (!o) {
			debugger
			return
		}
		
		if ((this.parent && this.parent.matrixdirty) || (this.parent && this.parent.hasLayoutChanged && this.parent.hasLayoutChanged()))  {
			if (parent.recomputeMatrix){
				parent.recomputeMatrix()
				mat4.debug(parent.orientation.worldmatrix, true)
			}					
		}
	
		o.rotation[2] = this._rotation * 6.283 / 360.0;
		
		if (this.layout) {
			var s = o.scale
			var r = o.rotation
			var t = vec3(this.layout.left, this.layout.top, 0)
			if (this._position === "absolute"){
				t[0] = this._pos[0]
				t[1] = this._pos[1]
			}
			var hw = ( this.layout.width !== undefined? this.layout.width: this._width ) /  2;
			var hh = ( this.layout.height !== undefined ? this.layout.height: this._height) / 2;
			mat4.TSRT(-hw, -hh, 0, s[0], s[1], s[2], r[0], r[1], r[2], t[0] + hw * s[0], t[1] + hh * s[1], t[2], this.orientation.matrix);
					
			//for (var i =0 ;i<16;i++) if (isNaN(this.orientation.matrix[i] )) debugger;	
			//console.log(this.layout)
		}
		else {
			var s = o.scale
			var r = o.rotation
			var t = o.translation
			var hw = this._size[0] / 2
			var hh = this._size[1] / 2
			mat4.TSRT(-hw, -hh, 0, s[0], s[1], s[2], r[0], r[1], r[2], t[0] + hw * s[0], t[1] + hh * s[1], t[2], this.orientation.matrix);
				//for (var i =0 ;i<16;i++) if (isNaN(this.orientation.matrix[i] )) debugger;
		}
		
		this.orientation.invertedworldmatrix = undefined
		if (this.parent ) {
				if ( this.parent.orientation){
					this.orientation.worldmatrix = mat4.mul(this.orientation.matrix,this.parent.orientation.worldmatrix );
				} else {
					if (this.parent.matrix){
						this.orientation.worldmatrix = mat4.mul(this.orientation.matrix,this.parent.matrix);
					} else {
						//console.log("hmm?");
					}
				}
		} else {
			console.log("ehhhm")
			this.orientation.worldmatrix = this.orientation.matrix		
		}
		
		this.matrixdirty = false
	}
	
	this.destroy = function(){
		if (this.preDraw) this.screen.unregisterPredraw(this)
		if (this.postDraw) this.screen.unregisterPostdraw(this)
	}
	
	this.orientation = {}
	this.orientation.worldmatrix = mat4.identity()

	this.renderQuad = function(texture, rect) {}

	this.setMatrixUniforms = function(renderstate){
		var bg = this.bg_shader;
		var fg = this.fg_shader;		
		var brd = this.border_shader;		
		bg._matrix = renderstate.matrix;
		fg._matrix = renderstate.matrix;
		brd._matrix = renderstate.matrix;
		bg._viewmatrix = renderstate.viewmatrix;
		fg._viewmatrix = renderstate.viewmatrix;
		brd._viewmatrix = renderstate.viewmatrix;
	}
	
	this.drawStencil = function (renderstate) {
		this.setMatrixUniforms(renderstate);
			if(this.layout){
				if (this.bg_shader.setupSize) this.bg_shader.setupSize(this.layout.width? this.layout.width: this._width, this.layout.height? this.layout.height: this._height, this._cornerradius);
				if (this._borderwidth[0] > 0 && this.border_shader.setupBorder) this.border_shader.setupBorder(this.layout.width? this.layout.width: this._width, this.layout.height? this.layout.height: this._height, this._cornerradius, this._borderwidth);
			}
			else{
				if (this.bg_shader.setupSize) this.bg_shader.setupSize(this._width, this._height, this._cornerradius);
				if (this._borderwidth[0] > 0 && this.border_shader.setupBorder) this.border_shader.setupBorder(this.layout.width? this.layout.width: this._width, this.layout.height? this.layout.height: this._height, this._cornerradius, this._borderwidth);
			}

		this.bg_shader.draw(renderstate.device)
		if (this._borderwidth[0] > 0) this.border_shader.draw(renderstate.device)
	}

	this.show = function(){
		if(!this.dom) return
		this.dom.style.display = 'block'
	}

	// called by diffing
	this.atDestroy = function(){

		if (this.screen) this.screen.requestLayout();

		if(this.dom) this.dom.parentNode.removeChild(this.dom)
	}

	this.drawContentDali = function(renderstate){

	}

	this.doDraw = function(renderstate){
		this.bg_shader._time = this.screen.time
		this.fg_shader._time = this.screen.time
		this.border_shader._time = this.screen.time

		this.bg_shader.view = this
		this.border_shader.view = this
		this.fg_shader.view = this

		this.bg_shader.draw(this.screen.device)
		if (this.fg_shader) this.fg_shader.draw(this.screen.device)
		if (this._borderwidth[0] > 0) this.border_shader.draw(this.screen.device)
		
		// lets check if we have a reference on time
		if(this.bg_shader.shader && this.bg_shader.shader.unilocs.time || 
			this.border_shader.shader && this.border_shader.shader.unilocs.time || 
			this.fg_shader.shader && this.fg_shader.shader.unilocs.time){
			//console.log('here')
			this.screen.node_timers.push(this)
		}
	}

	this.doDrawGuid = function(renderstate){
		this.bg_shader._viewmatrix = renderstate.viewmatrix;		
		this.border_shader._viewmatrix = renderstate.viewmatrix;		
		
		this.bg_shader.drawGuid(this.screen.device)
		if (this._borderwidth[0] > 0)this.border_shader.drawGuid(this.screen.device)
	}

	this.drawContentGL = function(renderstate){
		//mat4.debug(this.orientation.matrix);
		var bg = this.bg_shader
		var fg = this.fg_shader
		var brd = this.border_shader
		
		var bound = this.getBoundingRect()

		this.lastdrawnboundingrect.left = bound.left
		this.lastdrawnboundingrect.right = bound.right
		this.lastdrawnboundingrect.top = bound.top
		this.lastdrawnboundingrect.bottom = bound.bottom

		if (this.texturecache == false || this.texturecache == true && this.dirty){
			// idea reference outer node using shader.node
			// and 
			if (this.matrixdirty) this.recomputeMatrix()
			this.setMatrixUniforms(renderstate);
			
			if(this.layout){
				if (this.bg_shader.setupSize) this.bg_shader.setupSize(this.layout.width? this.layout.width: this._width, this.layout.height? this.layout.height: this._height, this._cornerradius);
				if (this._borderwidth[0] > 0 && this.border_shader.setupBorder) this.border_shader.setupBorder(this.layout.width? this.layout.width: this._width, this.layout.height? this.layout.height: this._height, this._cornerradius, this._borderwidth);
			}
			else{
				if (this.bg_shader.setupSize) this.bg_shader.setupSize(this._width, this._height, this._cornerradius);
				if (this._borderwidth[0] > 0 && this.border_shader.setupBorder) this.border_shader.setupBorder(this.layout.width? this.layout.width: this._width, this.layout.height? this.layout.height: this._height, this._cornerradius, this._borderwidth);
			}
	
			if (this.texturecache == false){
				var myrect = rect(bound.left, bound.top, bound.right, bound.bottom);

				var actuallyvisible = true
				if (renderstate.cliprect){
					actuallyvisible = rect.intersects(myrect, renderstate.cliprect);
					if (actuallyvisible == false){
				//		console.log("rects: ", myrect, renderstate.cliprect);
					}
				} 
				
				if (isNaN(myrect[0])){
					actuallyvisible = true;
				}
				if ( actuallyvisible == false && renderstate.drawmode == 0){
					//console.log("hmm?");
						//this.screen.debugtext(bound.left, bound.top+15, "ND" );
					//console.log(myrect, renderstate.boundrect);
					return false;
				}
			}
			
			bg._borderwidth = this._borderwidth[0]
			brd._borderwidth = this._borderwidth[0]
			//console.log(this.effectiveopacity);
			brd._alpha = fg._alpha = bg._alpha = this.effectiveopacity
			brd._opacity = fg._opacity = bg._opacity = this.effectiveopacity

			fg._fgcolor = this._fgcolor
			bg._bgcolor = this._bgcolor

			brd._bordercolor = this._bordercolor
			bg._radius = this._cornerradius
			brd._radius = this._cornerradius

			fg.screen = this.screen
			bg.screen = this.screen
			brd.screen = this.screen
			
			
			if(renderstate.drawmode === 2){
				var type = bg.drawDebug(this.screen.device)
				if(type) renderstate.debugtypes.push(type)
				type = fg.drawDebug(this.screen.device)
				if(type) renderstate.debugtypes.push(type)
			}
			else if(renderstate.drawmode === 1){
				if(this.has_mouse_interaction){
					this.effectiveguid = this.interfaceguid;
				}
				else{
					this.effectiveguid = this.parent.effectiveguid;					
				}
				var r = ((this.effectiveguid &255)) / 255.0
				var g = ((this.effectiveguid>>8) &255) / 255.0
				var b = ((this.effectiveguid>>16) &255) / 255.0
				bg._guid = vec4(r, g, b, 1.0)
				this.doDrawGuid(renderstate)
			}
			else{
				
				this.doDraw(renderstate)
			}
			this.dirty = false;
		} 
		else {
			console.log("Drawing cached content")
			this.renderQuad(textureID, this.getBoundingRect())
		}
		//this.dirty = false;
		return true
	}
	
	this.drawContent = this.drawContentGL

	this.hideContent = function(){
		
	}
	
	this.hasLayoutChanged = function(){
		var changed = false
		
		if (this.layout && !this.lastLayout){
				changed = true
				this.lastLayout = {left:0, top:0, width:0, height:0, right: 0, bottom: 0}
		}
		if (!this.layout && this.lastLayout) changed = true
		
		if (this.layout){
			if (this.layout.left != this.lastLayout.left) changed = true
			if (this.layout.top != this.lastLayout.top) changed = true
			if (this.layout.right != this.lastLayout.right) changed = true
			if (this.layout.bottom != this.lastLayout.bottom) changed = true
		}
		if (changed){
//			this.layoutchanged();
//			this.setDirty();
			//this.setDirty(true, this.lastLayout)
		}
		if (this.layout) this.lastLayout= {left:this.layout.left, top:this.layout.top, width:this.layout.width, height:this.layout.height, right: this.layout.right, bottom:this.layout.bottom};
		return changed;
	}
	
	this.draw = function(renderstate){
		if (this.atDraw) this.atDraw(renderstate)
		if (this.visible){
			if (this.dirty != false || this.hasLayoutChanged()) {
				//if(this.matrixdirty) 
				this.recomputeMatrix();

				this.effectiveopacity = this._opacity !== undefined ? this._opacity : 1.0;
				if (this.parent !== undefined && this.parent.effectiveopacity !== undefined) {
					this.effectiveopacity *= this.parent.effectiveopacity;
				}
			}

			var prevmatrix = mat4.copy(renderstate.matrix)
			this.orientation.worldmatrix = mat4.mul(this.orientation.matrix, renderstate.matrix)
			renderstate.matrix = mat4.copy(this.orientation.worldmatrix)

			var actuallyclipping = this._clipping == true || this.texturecache != false

			if (actuallyclipping) renderstate.pushClip(this)

			var onscreen = this.drawContent(renderstate) // should check against bounds?
		//	onscreen = true;

			if (actuallyclipping) renderstate.stopClipSetup();

			if ((actuallyclipping && onscreen) || actuallyclipping == false) {
				if (this.threedee) {renderstate.setupPerspective();}
				if (this.children) for (var i = 0; i < this.children.length; i++) {
					var child = this.children[i]
					if (child.draw) {
						this.children[i].draw(renderstate);
					}
				}
				if (this.threedee){renderstate.popPerspective();}
			}
			
			if (actuallyclipping) renderstate.popClip(this);

			renderstate.matrix = prevmatrix;
		}
		else this.hideContent()
		//this.screen.device.redraw()
	}

	// give it keyboard focus
	this.focus = function(){
		this.screen.setFocus(this)
	}

	this.spawn = function (parent) {}

	// DOM nodes

	var lastindex = 1000
	this.setDomFullscreen = function(set){
		this._domfullscreen = set
		if(set === false) return
		var dom = this.dom
		dom.style.zIndex = lastindex++
		dom.style.transformOrigin = '0px 0px'
		dom.style.transform = ''
		dom.style.width = document.body.offsetWidth
		dom.style.height = document.body.offsetHeight
		dom.style.left = 0
		dom.style.top = 0
	}

	var all_dom_nodes = []
	// we need to reuse them iframes on 

	this.drawContentDOM = function(renderstate){
		if (this.matrixdirty) this.recomputeMatrix()
		// lets check if we have a div

		var dom = this.dom
		if(!dom){
			if(this.domid !== undefined){
				var cache_parent = this
				while(cache_parent && !cache_parent.dom_node_cache) cache_parent = cache_parent.parent
			}
			if(cache_parent && cache_parent.dom_node_cache){
				dom = this.dom = cache_parent.dom_node_cache[this.domid]
			}
			if(!dom){
				dom = this.dom = document.createElement(this.tag || 'iframe')
				all_dom_nodes.push(this)

				var parent = this.screen.device.canvas.parentNode
				parent.appendChild(this.dom)
				

				dom.style.position = 'absolute' 
				dom.style.display = 'block'
				dom.style.border = '0px'

				if(cache_parent) cache_parent.dom_node_cache[this.domid] = dom
			}
			if(dom.src !== this.src) dom.src = this.src
			//if(this.src) dom.src = this.src
		}

		var r = this.getBoundingRect();
		
		if (!this._domfullscreen && r){
			var scalex = this.domscale || 1
			dom.style.transformOrigin = '0px 0px'
			dom.style.transform = 'scaleX('+(1/scalex)+') scaleY('+(1/scalex)+')'
			//dom.style.rotateY = '90degrees'
			dom.style.width = (Math.floor(r.right - r.left))*scalex
			dom.style.height = (Math.floor(r.bottom - r.top))*scalex
			dom.style.left = Math.floor(r.left)
			dom.style.top = Math.floor(r.top)
		//	console.log(r)	
		}
		else if(this._domfullscreen){
			dom.style.width = document.body.offsetWidth
			dom.style.height = document.body.offsetHeight
			dom.style.left = 0
			dom.style.top = 0
		}
		
		dom.onload = function(){
			window.addEventListener("message", function(msg){
				// we received a closewindow from msg
				if(msg.data.type === 'closewindow'){
					console.log('CLOSEWINDOW')
					for(var i = 0; i < all_dom_nodes.length; i++){
						all_dom_nodes[i].setDomFullscreen(false)
						all_dom_nodes[i].setDirty(true)
					}
				//	dom.style.display = 'none'
				}
			}, false);
		}
		var bg = this._bgcolor
		if(bg){
			dom.style.backgroundColor = 'rgba('+parseInt(255*bg[0])+','+parseInt(255*bg[1])+','+parseInt(255*bg[2])+','+parseInt(255*bg[3])+')'
		}
		// we have to append it to our parent
	}


	this.hideProperty(Object.keys(this))

})
