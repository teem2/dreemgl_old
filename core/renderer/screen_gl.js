// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class('./screen_base', function screen(require, exports, self, baseclass) {
	
	// The screen is a root-level visual class responsible for managing rendering and event dispatch to all nodes on the 
	var GLDevice = require('$gl/gldevice')
	var GLShader = require('$gl/glshader')
	var GLTexture = require('$gl/gltexture')
	var GLText = require('$gl/gltext')

	var Mouse = require('$renderer/mouse_web')
	var Keyboard = require('$renderer/keyboard_web')
	var Touch = require('$renderer/touch_web')

	var Text = require('./text_gl')
	var RenderState = require('./renderstate_gl')
	var FlexLayout = require('$lib/layout')

	var renderer = require('$renderer/renderer')

	this.attribute('locationhash', {type:Object})

	this.layoutRequested = true
	this.dirty = true
	this.dirtyrectset = false
	this.debugshader = false
	this.debug = false
	this.debugalldirtyrects = true
	this.showdebugtext = true
	this.renderstructure = false
	this.lastx = -1
	this.lasty = -1
	
	this.rpcproxy = false

	this.state("postdraw_registry", "predraw_registry", "free_guids", 'locationhash', 'pic_tex','debug_tex','device','buf','mouse','keyboard','debugtextshader',
		'utilityrectangle','debugrectangle','utilityframe','_init')

	this.atConstructor = function(){
		this.renderstate = new RenderState()
		this.totaldirtyrect = {}
	}

	this.initVars = function(){
		this.guidmap = {}
		this.guidmap[0] = this
		this.mousecapture = false
		this.mousecapturecount = false
		this.lastmouseguid = 0
		this.lastidundermouse = 0
		this.effectiveguid = 0
		this.interfaceguid = 1
		this.readGuidTimeout = this.readGuidTimeout.bind(this)
	}

	this.init = function (previous) {

		if(previous){
			this.touch = previous.touch
			this.mouse = previous.mouse
			this.keyboard = previous.keyboard

			this.pic_tex = previous.pic_tex
			this.debug_tex = previous.debug_tex
			this.device = previous.device
			
			this.utilityrectangle = previous.utilityrectangle
			this.utilityframe = previous.utilityframe
			this.debugrectangle = previous.debugrectangle
			this.debugtextshader = previous.debugtextshader
		}
		else{
			// otherwise lets reuse em
			this.touch = new Touch()
			this.mouse = new Mouse()
			this.keyboard = new Keyboard()

			this.pic_tex = GLTexture.rgba_depth_stencil(16, 16)
			this.debug_tex = GLTexture.rgba_depth_stencil(16, 16)	
			this.device = new GLDevice()

			this.initDebugShaders()
		}

		this.debuglabels = []
		this.decodeLocationHash()

		this.buf = new Uint8Array(4)
		this.free_guids = []
		this.predraw_registry = []
		this.postdraw_registry = []
		this.modal_stack = []
			
		this.initVars()
		this.bindInputs()
	}

	// close top level modal view.
	// <value> the return value for the promise of the modal. 
	this.closeModal = function(value){
		if(this.modal && this.modal.resolve)
			return this.modal.resolve(value)
	}
	
	// show a modal view.
	this.openModal = function(object){
	// <object> a constructor function for a set of visual elements. Works the same as the render function.
		return new Promise(function(resolve, reject){
			renderer(object, undefined, this.globals)
			object.parent = this
			this.children.push(object)
			this.modal_stack.push(object)
			this.modal = object

			object.resolve = function(value, rej){
				// lets close the modal window
				var id = this.screen.children.indexOf(this)
				this.screen.children.splice(id, 1)

				if(rej) reject(value)
				else resolve(value)

				var modal_stack = this.screen.modal_stack
				modal_stack.pop()
				this.screen.modal = modal_stack[modal_stack.length - 1]
				
				this.setDirty();
				this.emitRecursive("destroy");
				this.screen.setDirty(true)
			}

			object.reject = function(value){
				this.resolve(value, true)
			}

			object.reLayout()
			object.setDirty(true)
		}.bind(this))
	}

	// check if a given node is available for interaction in the current modal chain.
	// <node> the node to be checked.
	this.inModalChain = function(node){
		if(!this.modal_stack.length) return true
		var last = this.modal_stack[this.modal_stack.length - 1]
		// lets check if any parent of node hits last
		var obj = node
		while(obj){
			if(obj === last) return true
			obj = obj.parent
		}
		return false
	}
	
	this.drawGuid = function(){
		this.renderstate.setup(this.device, 2, 2, this.mouse.x - 1, -this.device.size[1] + (this.mouse.y) + 1)
		//this.renderstate.translate(- this.mouse.x + 1, this.device.size[1] - (this.mouse.y) - 1);
		this.renderstate.drawmode = 1

		this.device.clear(vec4(0, 0, 0, 1))
		this.device.gl.clearStencil(0)
		//this.device.clear(this.device.gl.STENCIL_BUFFER_BIT);
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].draw(this.renderstate)
		}
	}

	this.readGuid = function(){
		//return
		//return
		this.device.gl.flush();
		this.device.gl.readPixels(1 * this.device.ratio, 1 * this.device.ratio, 1, 1, this.device.gl.RGBA, this.device.gl.UNSIGNED_BYTE, this.buf);
		var id = this.buf[0] + (this.buf[1] << 8) + (this.buf[2] << 16)
		this.lastidundermouse = id

		if (this.mousecapture !== false) {
			id = this.mousecapture;
		}

		this.setguid(id);
	}

	this.remapMouse = function(node){
		if (node && node.getWorldMatrix){
			var M = node.getWorldMatrix()
			var screenw = this.device.main_frame.size[0] / this.device.main_frame.ratio
			var screenh = this.device.main_frame.size[1] / this.device.main_frame.ratio
			var M2 = mat4.ortho(0, screenw, 0, screenh, -100, 100)
			var M3 = mat4.mul( M, M2)
			var M3i = mat4.invert(M3)
			var R = vec2.mul_mat4_t(vec2(this.mouse.glx, this.mouse.gly), M3i)
			return R
		}
	}
	
	this.registerPredraw = function(node){
		this.predraw_registry.push(node)
	}
	
	this.unregisterPredraw = function(node){
		var idx = this.predraw_registry.indexOf(node)
		if (idx >-1) this.predraw_registry.splice(idx, 1)
	}
	
	this.registerPostdraw = function(node){
		this.postdraw_registry.push(node)
	}
	
	this.unregisterPostdraw = function(node){
		var idx = this.postdraw_registry.indexOf(node)
		if (idx >-1) this.postdraw_registry.splice(idx, 1)
	}
	
	this.allocGuid = function(node){
		if (this.free_guids.length > 0){
			var reusedguid = this.free_guids.pop()
			this.guidmap[reusedguid] = node
			return reusedguid
		}
		
		var newguid = this.interfaceguid++
		this.guidmap[newguid] = node
		return newguid;
	}

	this.freeGuid = function(guid){
		var node = this.guidmap[guid]
		this.guidmap[guid] = undefined
		this.free_guids.push(guid)
	}
	
	this.setguid = function(id){

		var screenw = this.device.main_frame.size[0] / this.device.main_frame.ratio
		var screenh = this.device.main_frame.size[1] / this.device.main_frame.ratio
		
		this.mouse.glx = (this.mouse.x/(screenw/2)) - 1
		this.mouse.gly = -(this.mouse.y/(screenh/2) - 1)

		if(id != this.lastmouseguid || this.mouse.x != this.lastx || this.mouse.y != this.lasty){
		
			this.lastx = this.mouse.x
			this.lasty = this.mouse.y
			
			var overnode = this.guidmap[id]
			if (this.inModalChain(overnode) && overnode && overnode.hasListeners){
				if(overnode.hasListeners('mousemove')){
					overnode.emit('mousemove', this.remapMouse(overnode))
				}
			}
		}

		if(id != this.lastmouseguid){
			var overnode = 	this.guidmap[this.lastmouseguid];
			if (overnode && overnode.emit) overnode.emit('mouseout')

			if (this.uieventdebug){
				$$("mouseout: " + this.guidmap[this.lastmouseguid].constructor.name + "(" + this.lastmouseguid + ")")
			}
			if (this.uieventdebug){
				$$("mouseenter: " + this.guidmap[id].constructor.name + "(" + id + ")")
			}
			var overnode = this.guidmap[id]
			if (this.inModalChain(overnode) && overnode) overnode.emit('mouseover')
			this.lastmouseguid = id
		}
	}

	this.hasDirtyRect = function(){
		return this.dirtyrectset
	}

	this.drawColorFrames = 0

	this.drawColor = function(){
		this.drawColorFrames++
		var clippedrect = false
		var donesetup = false
		
		var devw = (this.device.size[0] * this.device.ratio)
		var devh = (this.device.size[1] * this.device.ratio)
		
		var w = devw
		var h = devh
		var x = 0
		var y =	0
	
		if (this.hasDirtyRect()){
			w = this.totaldirtyrect.right - this.totaldirtyrect.left
			h = this.totaldirtyrect.bottom - this.totaldirtyrect.top
			x = this.totaldirtyrect.left
			y =	this.totaldirtyrect.top

			if (isNaN(w) || isNaN(h)  ){
				//	console.log("Nans?", this.totaldirtyrect, h, w)
				//	this.debugtext(0,0,"Full screen repaint: " + this.drawColorFrames);
			}
			else {
				this.renderstate.setup(this.device)
				clippedrect = true
				donesetup = true
			
				if(this.debug){
					this.debugSetupUtilityRect(w, h)
				}
			//	this.utilityrectangle.draw(this.device);
				this.renderstate.cliprect =  rect(this.totaldirtyrect.left,this.totaldirtyrect.top,this.totaldirtyrect.left+ w,this.totaldirtyrect.top+ h);;
			//	this.renderstate.stopClipSetup();
			}
		}
		
		if (donesetup == false){
			this.renderstate.setup(this.device)
			this.device.gl.clearStencil(0)
		}

		this.orientation = {}
		this.orientation.worldmatrix = mat4.identity()
		this.invertedworldmatrix =  mat4.invert(this.orientation.worldmatrix)
		this.renderstate.debugmode = false
		this.renderstate.drawmode = 0
		
		if (this.renderstructure){
			this.device.clear(vec4("black"))

			for (var i = 0; i < this.children.length; i++){
				this.debugRenderBoundingBox(this.children[i], 0)
			}
		} 
		else {
			
			if (clippedrect){
				this.device.gl.enable(this.device.gl.SCISSOR_TEST)
				var ratio = this.device.ratio
				this.device.gl.scissor(x*ratio, (devh -  y*ratio -h*ratio),w *ratio,h *ratio)
			}
			
			this.device.clear(this.bgcolor)
			
			for (var i = 0; i < this.children.length; i++){
				this.children[i].draw(this.renderstate)
			}

			if (clippedrect){
				this.device.gl.disable(this.device.gl.SCISSOR_TEST);
			}
		}
		
		if (this.debug){
			this.drawDebugShaders()
		}
		
		this.dirtyrects = []
	}

	this.readGuidTimeout = function(){
		var dt = Date.now()
		this.device.setTargetFrame(this.pic_tex)
		this.readGuid()
	}
	
	this.computeBoundingRects = function (node){
		var total = 1;
		//if (node.dirty === false) return;
		if (node.getBoundingRect) {
			var br = node.getBoundingRect(true)
			var pr = node.getLastDrawnBoundingRect()
			if (br.left != pr.left || br.top != pr.top || br.right != pr.right || br.bottom != pr.bottom) {
				node.lastdrawnboundingrect = br
				this.addDirtyRect(br)
				this.addDirtyRect(pr)
			}
			else{
				if (node.dirtynode){
					this.addDirtyRect(br)
					node.dirtynode = false
				}
			}
		}
		for(var a = 0; a < node.children.length; a++){
			total += this.computeBoundingRects(node.children[a])
		}
		return total;
	}
	
	this.performLayout = function(){

		this._width = this.device.main_frame.size[0]/ this.device.main_frame.ratio
		this._height = this.device.main_frame.size[1]/ this.device.main_frame.ratio
		this._size = [this._width, this._height]
		this._pos = [0,0]
		this._flexdirection = "column" 
		
		this._top = 0
		this._left = 0
		this._right = this._width
		this._bottom = this._height

		FlexLayout.fillNodes(this)
		var layouted = FlexLayout.computeLayout(this)
	}
	
	this.draw_calls = 0
		
	this.draw = function (time) {
		var anim = this.doAnimation(time)
		this.draw_calls ++
		
		if (this.layoutRequested)  {
			this.performLayout()
			this.layoutRequested = false
		}
		
		if (this.dirty === true) {
			this.rendering = false

			var computed = this.computeBoundingRects(this)

			for(var a in this.predraw_registry){
				this.predraw_registry[a].preDraw()
			}
		}
		
		this.time = time
		this.last_time = time

		if (this.moved === true && !this.mousecapture) {//} || this.dirty === true) {
			this.moved = false
			if (!this.pic_tex.frame_buf) this.pic_tex.allocRenderTarget(this.device)
			this.device.setTargetFrame(this.pic_tex)
			
			this.rendering = true
			this.drawGuid()
			this.rendering = false
			// make sure reading the texture is delayed otherwise framerate is destroyed
			this.readGuidTimeout()
		}
		
		if (this.dirty === true) {
			this.device.setTargetFrame()

			this.node_timers = []

			this.rendering = true
			this.drawColor()
			this.rendering = false
			this.dirty = false

			if (this.dirtyrectset){
				this.lastdrawnboundingrect = this.totaldirtyrect
			}
			else{
				this.lastdrawnboundingrect = this.getBoundingRect()
			}
			
			this.totaldirtyrect = {}
			this.dirtyrectset = false

			if(this.has_timers) this.setDirty(true)

			for(var a in this.postdraw_registry){
				this.postdraw_registry[a].postDraw(this.device)
			}
		}

		if (this.debugshader === true) {
			if (!this.debug_tex.frame_buf) this.debug_tex.allocRenderTarget(this.device)
			this.device.setTargetFrame(this.debug_tex)
			this.drawDebug()
		}

		for(var i = 0; i < this.node_timers.length; i++){
			this.node_timers[i].setDirty(true)
		}

		if(anim || this.hasListeners('time')) {
			this.device.redraw()
		}
	}


	// Dirty rect handling


	this.dirtyNodes = []
	
	this.addDirtyNode =function(node){
		if (this.rendering === true) return;
		
		this.dirtyNodes.push(node)
		node.dirtynode = true
		node.bubbleDirty()
	}
	
	this.dirtyrects = []
	
	this.lastdrawnboundingrect = {left:0, right: 0, top:0, bottom:0}

	this.getLastDrawnBoundingRect = function(){
		return this.getBoundingRect()
	}
	
	this.getBoundingRect = function(){
		return {left:0, right: this.size[0], top:0, bottom:this.size[1]}
	}
	
	this.addDirtyRect = function(rect, tag){				
		// round to visible pixels.. round up.
		var w = rect.right - rect.left
		var h = rect.bottom - rect.top

		if (w == 0 || h == 0) {
			//zero area rect;
			return
		}
		
		var rrect = {bottom: Math.ceil(rect.bottom+1), right:  Math.ceil(rect.right+1), left:  Math.floor(rect.left-1), top: Math.floor(rect.top-1)}
		
		this.dirtyrects.push(rect)
		
		if (isNaN(w) || isNaN(h)) {
			return;
		}
		
		//if (this.debug){
		//	this.debugtext(rect.left, rect.top, rect.left + " " +rect.top +  " " + rect. right + " "+  rect.bottom, vec4("white") );	
		//}
		
		if (this.dirtyrectset === true){	
			//console.log("adding to existing dirtyrect: ", rect);	
			this.totaldirtyrect.top = Math.min(this.totaldirtyrect.top, rrect.top)
			this.totaldirtyrect.bottom = Math.max(this.totaldirtyrect.bottom, rrect.bottom)
			this.totaldirtyrect.left = Math.min(this.totaldirtyrect.left, rrect.left)
			this.totaldirtyrect.right = Math.max(this.totaldirtyrect.right, rrect.right)
		}else{
			//console.log("replacing existing dirtyrect: ", rect);	
			this.totaldirtyrect = rrect
		}
		
		this.dirtyrectset = true
	}
	
	this.bubbleDirty = function(){
		
		if (this.screen.rendering) return
		
		this.dirty = true
		//this.moved = true;
		if (this.device) this.device.redraw()
	}
	
	this.requestLayout = function(){
		if (this.layoutRequested === true)  return
		this.layoutRequested = true
		if (this.screen.rendering) return
		this.bubbleDirty()
	}
	
	this.atRender = function(){
		this.requestLayout()
	}
	
	this.setDirty = function(){		
		this.bubbleDirty()
	}

	this.onmoved = function(value){
		if (value === true && this.device !== undefined){
			this.device.redraw()
		}
		return value
	}
	/*
	this.copyProps = function(other){
		// lets copy the old props
		var keys = Object.keys(other)
		for(var i = 0; i < keys.length ; i++){
			var key = keys[i]
			if(other.__lookupGetter__(key))continue
			if(key === 'children' || key.charAt(0) === '_') continue
			if(key === 'constructor_args' || 
				key === 'constructor_children' || 
				key === 'atAttributeGet') continue
			var value = other[key]
			if(typeof value === 'function') continue
			this[key] = value
		}
	}*/

	this.setFocus = function(object){
		if(this.focus_object !== object){
			var old = this.focus_object
			this.focus_object = object
			if(old) old.emit('focuslost')
			object.emit('focusget')
		}
	}

	this.focusNext = function(obj){
		// continue the childwalk.
		var screen = this, found 
		function findnext(node, find){
			for(var i = 0; i < node.children.length; i++){
				var obj = node.children[i]
				if(obj === find){
					found = true
				}
				else if(obj.tabstop && found){
					screen.setFocus(obj)
					return true
				}
				if(findnext(obj, find)) return true
			}
		}
		
		if(!findnext(this, obj)){
			found = true
			findnext(this)
		}
	}

	this.focusPrev = function(obj){
		var screen = this, last
		function findprev(node, find){
			for(var i = 0; i < node.children.length; i++){
				var obj = node.children[i]
				if(find && obj === find){
					if(last){
						screen.setFocus(last)
						return true
					}
				}
				else if(obj.tabstop){
					last = obj
				}
				if(findprev(obj, find)) return true
			}
		}
		if(!findprev(this, obj)){
			findprev(this)
			if(last) screen.setFocus(last)
		}
	}

	this.bindInputs = function(){

		window.onhashchange = function(){
			this.decodeLocationHash()
		}.bind(this)

		this.keyboard.down = function(v){
			if(!this.focus_object) return
			if(!this.inModalChain(this.focus_object)) return
			this.focus_object.emit('keydown', v)
		}.bind(this)

		this.keyboard.up = function(v){
			if(!this.focus_object) return
			if(!this.inModalChain(this.focus_object)) return
			this.focus_object.emit('keyup', v)
		}.bind(this)

		this.keyboard.press = function(v){
			// lets reroute it to the element that has focus
			if(!this.focus_object) return
			if(!this.inModalChain(this.focus_object)) return
			this.focus_object.emit('keypress', v)
		}.bind(this)

		this.keyboard.paste = function(v){
			// lets reroute it to the element that has focus
			if(!this.focus_object) return
			if(!this.inModalChain(this.focus_object)) return
			this.focus_object.emit('keypaste', v)
		}.bind(this)

		this.mouse.move = function(){
			if (this.mousecapture){
				this.setguid(this.lastmouseguid);
			}
			else{
				this.moved = true;
				this.device.redraw()
			}
		}.bind(this)

		this.mouse.leftdown = function(){
			if (this.mousecapture === false) {
				this.mousecapture = this.lastmouseguid;
				this.mousecapturecount = 1;
			} 
			else {
				this.mousecapturecount++;
			}
			var overnode = this.guidmap[this.lastmouseguid]
			// lets give this thing focus
			if (overnode){
				if(this.inModalChain(overnode)){
					this.setFocus(overnode)
					overnode.emit('mouseleftdown', this.remapMouse(overnode))
				}
				else if(this.modal){
					this.modal_miss = true
					this.modal.emit('miss', this.remapMouse(overnode))
				}
			} 
		}.bind(this)

		this.mouse.leftup = function(){ 
			this.mousecapturecount--;
			var overnode = this.guidmap[this.lastmouseguid]

			if (overnode && this.inModalChain(overnode)) overnode.emit('mouseleftup')
			if (this.mousecapturecount === 0) {
				this.mousecapture = false;
				this.setguid(this.lastidundermouse);
			}
		}.bind(this)

		this.mouse.click = function () {
			if(this.modal_miss){
				this.modal_miss = false
				return
			}
			if (this.lastmouseguid > 0) {
				if (this.uieventdebug){
					console.log(" clicked: " + this.guidmap[this.lastmouseguid].constructor.name);
				}
				var overnode = this.guidmap[this.lastmouseguid];
				if (this.inModalChain(overnode) && overnode && overnode.emit) overnode.emit('click')
			}
		}.bind(this)

		this.mouse.dblclick = function () {
			if(this.modal_miss){
				this.modal_miss = false
				return
			}			
			if (this.lastmouseguid > 0) {
				if (this.uieventdebug){
					console.log(" clicked: " + this.guidmap[this.lastmouseguid].constructor.name);
				}
				var overnode = this.guidmap[this.lastmouseguid];
				if (this.inModalChain(overnode) && overnode && overnode.emit) overnode.emit('dblclick')
			}
		}.bind(this)

		this.mouse.wheelx = function(){
			var overnode = this.guidmap[this.lastmouseguid]
			if(overnode && this.inModalChain(overnode)){
				while(overnode){
					if(overnode.hasListeners('mousewheelx')){
						overnode.emit('mousewheelx', this.mouse.wheelx)
						break
					}
					overnode = overnode.parent
				}
			}
		}.bind(this)

		this.mouse.wheely = function(){
			var overnode = this.guidmap[this.lastmouseguid]
			if(overnode && this.inModalChain(overnode)){
				while(overnode){
					if(overnode.hasListeners('mousewheely')){
						overnode.emit('mousewheely', this.mouse.wheely)
						break
					}
					overnode = overnode.parent
				}
			}
		}.bind(this)

		this.device.atResize = function(){
			this.layoutRequested = true;
			this.addDirtyRect({left: 0,top: 0,right: this.size[0], bottom: this.size[1]})
			this.bubbleDirty();	
		}.bind(this)

		this.device.atRedraw = function (time) {
			this.draw(time / 1000.)
		}.bind(this)
	}


	// Location hash


	this.decodeLocationHash = function(){
		// lets split it on & into a=b pairs, 
		var obj = {}
		var parts = location.hash.slice(1).split(/\&/)
		for(var i = 0; i < parts.length; i++){
			var part = parts[i]
			var kv = part.split(/=/)
			if(kv.length === 1) obj[kv[0]] = true
			else{
				obj[kv[0]] = kv[1]
			}
		}
		this.locationhash = obj
	}

	// dont fire this one
	this.locationhash = function(obj){
		var str = ''
		for(var key in obj){
			var value = obj[key]
			if(str.length) str += '&'
			if(value === true) str += key
			else str += key + '=' + value
		}
		location.hash = '#' + str
	}

		
	// DEBUG HELPERS


	this.frameconsolecounter = 0;
	
	this.frameconsoletext = function(text, color){
		if (color === undefined) color = vec4("white");
		this.debugtext(10, this.frameconsolecounter * 14, text, color);
		this.frameconsolecounter++;
	}
	
	this.debugtext = function(x,y,text,color){
		return;
		if (color === undefined) color = vec4("white");
		this.debuglabels.push({x:x, y:y, text:text, color: color});	
	}

	this.logDebug = function(value){
		console.log(value)
		document.title = value
	}

	this.debugRenderBoundingBox = function(node, depth){
		
		var bb = node.getBoundingRect();
		
		if (this.lastmouseguid == node.effectiveguid){
			this.utilityrectangle.viewmatrix = this.renderstate.viewmatrix;
			this.utilityrectangle.matrix = mat4.identity();
			this.utilityrectangle.frame = this.renderstate.frame;
			this.utilityrectangle.width = bb.right - bb.left;
			this.utilityrectangle.height = bb.bottom - bb.top;
			this.utilityrectangle.x = bb.left;
			this.utilityrectangle.y = bb.top;
			this.utilityrectangle.depth = depth;
			this.utilityrectangle.draw(this.device);
		}
		else{
			
		}
		
		this.utilityframe.viewmatrix = this.renderstate.viewmatrix;
		this.utilityframe.matrix = mat4.identity();
		this.utilityframe.frame = this.renderstate.frame;
		this.utilityframe.width = bb.right - bb.left;
		this.utilityframe.height = bb.bottom - bb.top;
		this.utilityframe.x = bb.left;
		this.utilityframe.y = bb.top;
		this.utilityframe.depth = depth;
		this.utilityframe.draw(this.device);
		
		for(var i = 0; i < node.children.length; i++){
			this.debugRenderBoundingBox(node.children[i], depth + 1);
		}
	}

	this.drawDebug = function(){
		this.renderstate.setup(this.device, 2, 2,-this.mouse.x + 1, this.device.size[1] - (this.mouse.y) - 1);
		//this.renderstate.translate(-this.mouse.x + 1, this.device.size[1] - (this.mouse.y) - 1);
		this.renderstate.drawmode = 2;
		this.renderstate.debugtypes = []
		this.device.clear(vec4(0.5, 0.5, 0.5, 1))
		this.device.gl.clearStencil(0);

		for (var i = 0; i < this.children.length; i++) {
			this.children[i].draw(this.renderstate)
		}
		this.device.gl.readPixels(1 * this.device.ratio, 1 * this.device.ratio, 1, 1, this.device.gl.RGBA, this.device.gl.UNSIGNED_BYTE, this.buf);
		// lets decode the types
		var type = this.renderstate.debugtypes[0]
		if (type) {
			if (this.buf[0] == 127 && this.buf[1] == 127 && this.buf[2] == 127) {
				this.logDebug('no debug')
			} 
			else {
				if (type == 'int') {
					var i = this.buf[2] < 128 ? -this.buf[0] : this.buf[0]// + this.buf[1]*255
						if (this.buf[1])
							i += this.buf[1] * 256
							this.logDebug(i)
				}
				if (type == 'float') {
					var i = this.buf[2] < 128 ? -this.buf[0] / 255 : this.buf[0] / 255 // + this.buf[1]*255
						if (this.buf[1])
							i += this.buf[1]
							this.logDebug(i)
				}
				if (type == 'vec2') {
					this.logDebug('(' + this.buf[0] / 255 + ',' + this.buf[1] / 255 + ')')
				}
				if (type == 'ivec2') {
					this.logDebug('(' + this.buf[0] + ',' + this.buf[1] + ')')
				}
				if (type == 'vec3') {
					this.logDebug('(' + this.buf[0] / 255 + ',' + this.buf[1] / 255 + ',' + this.buf[2] / 255 + ')')
				}
				if (type == 'ivec3') {
					this.logDebug('(' + this.buf[0] + ',' + this.buf[1] + ',' + this.buf[2] + ')')
				}
			}
		}
	}

	this.initDebugShaders = function(){

		this.utilityframe = new GLShader();
		this.utilityframe.has_guid = false;		
		this.utilityframe.draw_type = "LINE_STRIP";
		this.utilityframe.depth = 0;
		this.utilityframe.color = function(){return mix(vec4("yellow" ), vec4("purple"), 0.5 + 0.5*sin(depth*0.3));};
		this.utilityframe.mesh = vec2.array();
		this.utilityframe.mesh.push(vec2(0,0));
		this.utilityframe.mesh.push(vec2(1,0));
		this.utilityframe.mesh.push(vec2(1,1));
		this.utilityframe.mesh.push(vec2(0,1));
		this.utilityframe.mesh.push(vec2(0,0));
		this.utilityframe.viewmatrix = mat4;
		this.utilityframe.matrix = mat4;
		this.utilityframe.x = 10;
		this.utilityframe.y = 10;
		this.utilityframe.width = 100;
		this.utilityframe.frame = 0;
		this.utilityframe.height = 100;
		this.utilityframe.position = function(){return (vec2(mesh.x * width, mesh.y*height)  + vec2(x,y))* matrix * viewmatrix};

		this.utilityrectangle = new GLShader();
		this.utilityrectangle.has_guid = false;
		
		this.utilityrectangle.bgcolor1 = vec4(1.0,1.0,0.3,0.2);
		this.utilityrectangle.bgcolor2 = vec4(1.0,0.6,0.6,0.5);
		this.utilityrectangle.x = 10;
		this.utilityrectangle.y = 10;
		this.utilityrectangle.width = 100;
		this.utilityrectangle.frame = 0;
		this.utilityrectangle.height = 100;
		this.utilityrectangle.alpha = 0.4;
		this.utilityrectangle.color = function(){var t = (bgcolor1 + mesh.y  * (bgcolor2 - bgcolor1));return vec4( t.xyz, 1.0 * alpha);};
		this.utilityrectangle.mesh = vec2.array();
		this.utilityrectangle.mesh.length = 0;
		this.utilityrectangle.mesh.pushQuad(0,0,1,0,0,1,1,1);
		this.utilityrectangle.viewmatrix = mat4;
		this.utilityrectangle.matrix = mat4;
		
		this.utilityrectangle.position = function(){return (vec2(mesh.x * width, mesh.y*height)  + vec2(x,y))* matrix * viewmatrix};

		this.debugrectangle = new GLShader();
		this.debugrectangle.has_guid = false;
		this.debugrectangle.bgcolor1 = vec4(0.3,0.3,1.0,1.0);
		this.debugrectangle.bgcolor2 = vec4(0.0,0.0,1.0,1.0);
		this.debugrectangle.x = 10;
		this.debugrectangle.y = 10;
		this.debugrectangle.width = 100;
		this.debugrectangle.frame = 0;
		this.debugrectangle.height = 100;
		this.debugrectangle.alpha = 0.4;
		this.debugrectangle.color = function(){var t = (bgcolor1 + mesh.y  * (bgcolor2 - bgcolor1));return vec4( t.xyz, 1.0 * alpha);};
		this.debugrectangle.mesh = vec2.array();
		this.debugrectangle.mesh.length = 0;
		this.debugrectangle.mesh.pushQuad(0,0,1,0,0,1,1,1);
		this.debugrectangle.viewmatrix = mat4;
		this.debugrectangle.matrix = mat4;
		
		this.debugrectangle.position = function(){return (vec2(mesh.x * width, mesh.y*height)  + vec2(x,y))* matrix * viewmatrix};

		
		this.debugtextshader = new GLText()
		this.debugtextshader.has_guid = false
	}

	this.debugSetupUtilityRect = function(w, h){
		this.utilityrectangle.viewmatrix = this.renderstate.viewmatrix
		this.utilityrectangle.matrix = mat4.identity()
		this.utilityrectangle.frame = this.renderstate.frame
		this.utilityrectangle.bgcolor = vec4("black")
		
//		this.renderstate.pushClipRect(rect(0,0,0,0));
		this.utilityrectangle.width = w
		this.utilityrectangle.height = h
		this.utilityrectangle.x = this.totaldirtyrect.left
		this.utilityrectangle.y = this.totaldirtyrect.top
	}

	this.drawDebugShaders = function(){
		this.utilityframe.viewmatrix = this.renderstate.viewmatrix;
		this.utilityframe.matrix = mat4.identity();
		
		if (this.dirtyrectset){			
			this.utilityframe.width = this.totaldirtyrect.right - this.totaldirtyrect.left;
			this.utilityframe.height = this.totaldirtyrect.bottom - this.totaldirtyrect.top;
			this.utilityframe.x =  this.totaldirtyrect.left;
			this.utilityframe.y = this.totaldirtyrect.top;
			this.utilityframe.draw(this.device);
		}

		this.utilityframe.frame = this.renderstate.frame;			
		
		if (this.debugalldirtyrects){
			for (var i = 0; i < this.dirtyrects.length; i++){
				var bb = this.dirtyrects[i];
				this.utilityframe.width = bb.right - bb.left;
				this.utilityframe.height = bb.bottom - bb.top;
				this.utilityframe.x = bb.left;
				this.utilityframe.y = bb.top;
				this.utilityframe.depth = i;
				this.utilityframe.draw(this.device);
			}
		}
		
		if (this.debuglabels.length > 0 ){
			this.renderstate.setup(this.device);
	
			this.device.gl.clearStencil(0);
			if (this.renderstate.scissor) this.device.gl.disable(this.device.gl.SCISSOR_TEST);
			
			this.debugtextshader.viewmatrix = this.renderstate.viewmatrix;
			
			if(this.showdebugtext == true){			
				for(var a in this.debuglabels){
					var label = this.debuglabels[a]
					var textbuf = this.debugtextshader.newText()
					textbuf.font_size = 12
					textbuf.fgcolor = label.color
					textbuf.bgcolor = label.color
					textbuf.clear()
					textbuf.add(label.text)
				
					var ofx = [-1, 0, 1,-1,1,-1,0,1,0]
					var ofy = [-1,-1,-1, 0,0,1,1,1,0]
					this.debugtextshader.mesh = textbuf;
					this.debugtextshader.bgcolor = vec4("white");
					this.debugtextshader.fgcolor = vec4("black");

					for (var i =0 ; i < 9; i++){
						var t = mat4.identity();
						mat4.translate(t, vec3(label.x + ofx[i], label.y + ofy[i] + 10, 0), t);
						mat4.transpose(t,t);
						this.debugtextshader.matrix = t;
						if (i == 8) this.debugtextshader.fgcolor = label.color;									
						this.debugtextshader.draw(this.device);
					}					
				}
			}
			this.debuglabels = [];				
		}		
	}


})
