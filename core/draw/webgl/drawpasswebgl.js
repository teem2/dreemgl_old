/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(require, baseclass){
	// drawing

	this.atConstructor = function(gldevice, view){
		this.device = gldevice
		this.view = view
		view.drawpass = this
		// lets do the flatten
		this.draw_list = []

		this.addToDrawList(this.view, true)

		this.pick_viewmatrix = mat4.identity()
		this.pick_noscrollmatrix = mat4.identity()

		this.color_viewmatrix = mat4.identity()
		this.color_noscrollmatrix = mat4.identity()

	}

	
	this.atDestroy = function(){
		this.releaseTexture()
	}
		
	this.addToDrawList = function(view, isroot){
		//matrix = matrix? matrix: mat4.identity()
		//view.draw_matrix = mat4.mul_mat4(view.layout_matrix, matrix)
		this.draw_list.push(view)

		if(this.draw_list.length > 65535) throw new Error("Too many items in a drawpass, ID space out of range, you get a piece of pie.")
		if(isroot || !view._mode){
			var children = view.children
			if(children) for(var i = 0; i < children.length; i++){
				this.addToDrawList(children[i])
			}
		}
	}
	/*
	this.orderDrawList = function(){
		var zfunc = function(view){
			var res = 0
			// res = view.z
			if (view.transparent){
			// res = FARPLANE * 2 - res;
			}
			return res
		}
		
		for (var i = 0; i < this.draw_list.length; i++){
			var dl = this.draw_list[i]
			dl.zorder = zfunc(v)
		}
		
		this.draw_list.sort(function(a,b){return a.zorder < b.zorder})
	}

	this.nextPowerTwo = function(value){
		var v = value - 1
		v 
		v |= v >> 1
		v |= v >> 2
		v |= v >> 4
		v |= v >> 8
		v |= v >> 16
		return v + 1
	}
	*/

	this.poolDrawTargets = function(){
		var pools = this.device.drawtarget_pools
		if(!this.drawtargets) return
		for(var i = 0; i < this.drawtargets.length; i ++){
			var dt = this.drawtargets[i]
			if(!pools[dt]) pools[dt] = []
			pools[dt].push(this[dt])
			this[dt] = undefined
		}
	}

	this.allocDrawTarget = function(width, height, mode, drawtarget, passid){
		var Texture = this.device.Texture
		if(!this.drawtargets) this.drawtargets = []
		if(this.drawtargets.indexOf(drawtarget) === -1) this.drawtargets.push(drawtarget)
		var dt = this[drawtarget]
		//var twidth = this.nextPowerTwo(layout.width* main_ratio), theight = this.nextPowerTwo(layout.height* main_ratio)
		if(!dt){
			// lets scan the pools for a suitable drawtarget, otherwise create it
			var pool = this.device.drawtarget_pools[drawtarget]
			if(pool && pool.length){
				// first find a drawtarget with the same size
				for(var i = 0; i < pool.length; i ++){
					var tgt = pool[i]
					if(!tgt) continue
					var size = tgt.size
					if(size[0] === width && size[1] === height){
						// lets remove it from the pool
						pool.splice(i,1)
						dt = tgt
						break
					}
				}
				// then we find a drawtarget with the same passid as last time
				if(!dt){
					for(var i = 0; i < pool.length; i++){
						var tgt = pool[i]
						if(!tgt) continue
						if(passid === tgt.passid){
							dt = tgt
							pool.splice(i,1)
							break
						}
					}
				}
			}
			// otherwise we create a new one
			if(!dt){
				dt = this[drawtarget] = Texture.createRenderTarget(mode === '2D'?Texture.RGBA:Texture.RGBA|Texture.DEPTH|Texture.STENCIL, width, height, this.device)
			}
			else this[drawtarget] = dt
			dt.passid = passid
		} 
		// make sure the drawtarget has the right size
		var tsize = this[drawtarget].size
		if(width !== tsize[0] || height !== tsize[1]){
			this[drawtarget].delete()
			this[drawtarget] = Texture.createRenderTarget(mode === '2D'?Texture.RGBA:Texture.RGBA|Texture.DEPTH|Texture.STENCIL, width, height, this.device)
		}
	}

	this.drawPick = function(isroot, passid, mousex, mousey, debug){
		var view = this.view
		var device = this.device
		var layout = view.layout
		var drawcalls = 0
		if(!layout || layout.width === 0 || isNaN(layout.width) || layout.height === 0 || isNaN(layout.height)) return

		// make sure layers are pixel aligned
		layout.left = Math.floor(layout.left)
		layout.top = Math.floor(layout.top)
		layout.width = Math.floor(layout.width)
		layout.height = Math.floor(layout.height)

		if(isroot){
			if(!debug) this.allocDrawTarget(1, 1, this.view._mode, 'pick_buffer', passid)
		}
		else{
			var ratio = view._pixelratio
			if(isNaN(ratio)) ratio = device.main_frame.ratio
			var twidth = layout.width * ratio, theight = layout.height * ratio
			this.allocDrawTarget(twidth, theight, this.view._mode, 'pick_buffer', passid)
		}

		device.bindFramebuffer(this.pick_buffer || null)

		device.clear(0,0,0,0)
		
		var scroll = view._scroll

		 // 2d/3d switch
		if(view._mode === '2D'){
			if(isroot && !debug){
				mat4.ortho(mousex, 1 + mousex, 1 + mousey,  mousey, -100, 100, this.pick_viewmatrix)
			}
			else{
				var zoom = view._zoom
				if (isroot){
					mat4.ortho(scroll[0], layout.width*zoom+scroll[0], scroll[1], layout.height*zoom+scroll[1], -100, 100, this.pick_viewmatrix)
					mat4.ortho(0, layout.width, 0, layout.height, -100, 100, this.pick_noscrollmatrix)
				}
				else{
					mat4.ortho(scroll[0], layout.width*zoom+scroll[0], layout.height*zoom+scroll[1], scroll[1], -100, 100, this.pick_viewmatrix)
					mat4.ortho(0, layout.width, layout.height, 0, -100, 100, this.pick_noscrollmatrix)
				}
			}
		}
		else if(view._mode === '3D'){
			
			var p = mat4.perspective(view._fov * PI * 2/360.0 , layout.width/layout.height, view._nearplane, view._farplane)			
			var lookat = mat4.lookAt(view._camera, view._lookat, view._up)
			this.pick_viewmatrix = mat4.mat4_mul_mat4(lookat,p);
		}

		var pick = vec3()
		pick[0] = (((passid+1)*131)%256)/255
		// modulo inverse: http://www.wolframalpha.com/input/?i=multiplicative+inverse+of+31+mod+256
		for(var dl = this.draw_list, i = 0; i < dl.length; i++){

			var draw = dl[i]

			var subview = draw.layout
			if(draw._first_draw_pick){
				if(view._mode === '2D' && view.boundscheck){ // do early out check using bounding boxes
					var height = layout.height
					var width = layout.width
					if(draw.parent && draw.parent !== view){
						subview.absx = draw.parent.layout.absx + subview.left
						subview.absy = draw.parent.layout.absy + subview.top
					}
					else{
						subview.absx = subview.left
						subview.absy = subview.top
					}
					if(draw === view && view.sublayout){
						width = view.sublayout.width
						height = view.sublayout.height
					}
					// early out check
					if(draw !== view && !draw.noscroll){
						if( subview.absy - scroll[1] > height * zoom || subview.absy + subview.height - scroll[1] < 0){
							continue
						} 
						if(subview.absx - scroll[0] > width * zoom || subview.absx + subview.width - scroll[0] < 0){
							continue
						}
					}
				}
			}
			else draw._first_draw_pick = 1

			var id = ((i+1)*29401)%65536
			pick[1] = (id&255)/255
			pick[2] = (id>>8)/255

			draw.pickguid = pick[0]*255<<16 | pick[1]*255 << 8 | pick[2]*255
			draw.viewmatrix = this.pick_viewmatrix

			if(!draw._visible) continue
			if(draw._mode && draw.drawpass !== this && draw.drawpass.pick_buffer){
				// ok so the pick pass needs the alpha from the color buffer
				// and then hard forward the color
				var blendshader = draw.blendshader
				if (view._mode === '3D'){
					blendshader.depth_test = 'src_depth <= dst_depth'
				}
				else{
					blendshader.depth_test = ''
				}
				blendshader.texture = draw.drawpass.pick_buffer
				blendshader._width = draw.layout.width
				blendshader._height = draw.layout.height
				blendshader.drawArrays(this.device)
			}
			else{
				draw.updateShaders()
				// alright lets iterate the shaders and call em
				var shaders =  draw.shader_list
				for(var j = 0; j < shaders.length; j++){
					// lets draw em
					var shader = shaders[j]
					// we have to set our guid.
					shader.pick = pick
					//if(shader.order < 0) console.log(draw)
					if(shader.order < 0) draw.viewmatrix = this.pick_noscrollmatrix
					else draw.viewmatrix = this.pick_viewmatrix
					drawcalls++
					shader.drawArrays(this.device, 'pick')
				}
			}
		}
		//console.log('PICK', drawcalls)
	}

	var MyShader = define.class(this.Shader, function(){
		this.mesh = vec2.array()
		this.mesh.pushQuad(-1,-1,1,-1,-1,1,1,1)
		this.position = function(){
			return vec4(mesh.xy,0,1) 
		}
		this.color = function(){
			if(mesh.x<-0.9)return 'red'
			if(mesh.x>0.9)return 'red'
			return 'black'
		}
	})

	this.drawColor = function(isroot, time){
		var drawcalls = 0
		var view = this.view
		var device = this.device
		var layout = view.layout

		if(!layout || layout.width === 0 || isNaN(layout.width) || layout.height === 0 || isNaN(layout.height)) return
	
		// lets see if we need to allocate our framebuffer..
		if(!isroot){
			var ratio = view._pixelratio
			if(isNaN(ratio)) ratio = device.main_frame.ratio
			var twidth = layout.width * ratio, theight = layout.height * ratio	
			this.allocDrawTarget(twidth, theight, this.view._mode, 'color_buffer')
		}

		this.device.bindFramebuffer(this.color_buffer || null)

		if(layout.width === 0 || layout.height === 0) return
	
		device.clear(view._clearcolor)

		// 2d/3d switch
		var scroll = view._scroll
		var hastime = false
		if(view._mode === '2D'){
			var zoom = view._zoom
			if (isroot){
				mat4.ortho(scroll[0], layout.width*zoom+scroll[0], scroll[1], layout.height*zoom+scroll[1], -100, 100, this.color_viewmatrix)
				mat4.ortho(0, layout.width, 0, layout.height, -100, 100, this.color_noscrollmatrix)
			}
			else{
				mat4.ortho(scroll[0], layout.width*zoom+scroll[0], layout.height*zoom+scroll[1], scroll[1], -100, 100, this.color_viewmatrix)
				mat4.ortho(0, layout.width, layout.height, 0, -100, 100, this.color_noscrollmatrix)
			}
		}
		else if(view._mode === '3D'){
			view.perspectivematrix  = mat4.perspective(view._fov * PI * 2/360.0 , layout.width/layout.height, view._nearplane, view._farplane)			
			view.lookatmatrix = mat4.lookAt(view._camera, view._lookat, view._up)
			this.color_viewmatrix = mat4.mat4_mul_mat4(view.lookatmatrix,view.perspectivematrix);
		}

		view.colorviewmatrix = this.color_viewmatrix
		view.colornoscrollmatrix = this.color_noscrollmatrix
		
		// each view has a reference to its layer
		for(var dl = this.draw_list, i = 0; i < dl.length; i++){
			var draw = dl[i]
			var subview = draw.layout
			// we make some bad shit early out assumptions here
			if(draw._first_draw_color){
				if(view._mode === '2D' && view.boundscheck){ // do early out check using bounding boxes
					var height = layout.height
					var width = layout.width
					if(draw.parent && draw.parent !== view){
						subview.absx = draw.parent.layout.absx + subview.left
						subview.absy = draw.parent.layout.absy + subview.top
					}
					else{
						subview.absx = subview.left
						subview.absy = subview.top
					}
					if(draw === view && view.sublayout){
						width = view.sublayout.width
						height = view.sublayout.height
					}
					// early out check
					if(draw !== view && !draw.noscroll){
						if( subview.absy - scroll[1] > height * zoom || subview.absy + subview.height - scroll[1] < 0){
							continue
						} 
						if(subview.absx - scroll[0] > width * zoom || subview.absx + subview.width - scroll[0] < 0){
							continue
						}
					}
				}
			}
			else draw._first_draw_color = 1

			//if(view.constructor.name === 'slideviewer')console.log('here',draw.constructor.name, draw.text)
			draw._time = time
			
			if(draw._listen_time || draw.ontime) hastime = true
				
			draw.viewmatrix = this.color_viewmatrix

			if(!draw._visible) continue

			if(draw.atDraw){
				draw.atDraw(this)
			}
			if(draw._mode && draw.drawpass !== this && draw.drawpass.color_buffer){
				// ok so when we are drawing a pick pass, we just need to 1 on 1 forward the color data
				// lets render the view as a layer
				var blendshader = draw.blendshader
				if (view._mode === '3D'){
					blendshader.depth_test = 'src_depth <= dst_depth'
				}
				else{
					blendshader.depth_test = ''
				}
				blendshader.texture = draw.drawpass.color_buffer
				blendshader.width = draw.layout.width
				blendshader.height = draw.layout.height
				blendshader.drawArrays(this.device)

				drawcalls++
			}
			else{
				draw.updateShaders()
				// alright lets iterate the shaders and call em
				var shaders =  draw.shader_list
				for(var j = 0; j < shaders.length; j++){
					// lets draw em
					var shader = shaders[j]
					if(isNaN(shader.order)) continue // was pick only
					// we have to set our guid.
					if(shader.order < 0) draw.viewmatrix = this.color_noscrollmatrix
					else draw.viewmatrix = this.color_viewmatrix
					shader.drawArrays(this.device)
					drawcalls++
				}
			}
		}
		if(isroot){
			//if(!this.testshader) this.testshader = new MyShader()
			//this.testshader.drawArrays(this.device)
		}
		//console.log('COLOR', drawcalls, view.constructor.name)
		return hastime
	}
})