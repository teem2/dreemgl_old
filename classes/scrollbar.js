// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(view, text){
	
	// Color of the draggable part of the scrollbar
	this.attribute("draggercolor", {type: vec4, value: vec4("#9090b0")})
	
	// Color when the mouse is hovering over the draggable part of the scrollbar
	this.attribute("hovercolor", {type: vec4, value: vec4("#8080c0")})
	
	// Color of the draggable part of the scrollbar while actively scrolling
	this.attribute("activecolor", {type: vec4, value: vec4("#8080c0")})
	
	// Is this a horizontal or a vertical scrollbar? 
	this.attribute("vertical", {type: Boolean, value: true})
	
	// Current start offset of the scrollbar. Ranges from 0 to 1-page
	this.attribute("offset", {type:float, value:0})
	
	// Page size. Accepted range is 0 to 1
	this.attribute("page", {type:float, value:1.0})

	var scrollbar = this.constructor;
	
	define.example(this, function Usage(){
		return [scrollbar({vertical: false, height: 20, page: 0.2, offset: 0.5})]		
	})
	
	this.page = function(){
		this.setDirty(true)
	}

	this.offset = function(){
		this.setDirty(true);
	}
	
	this.hslider = function(){
		// we have a rectangle
		var rel = vec2(uv.x*width, uv.y*height)
		var edge = min(length(vec2(length(dFdx(rel)), length(dFdy(rel)))) * SQRT_1_2, 0.001)		
		var field = shape.roundbox(rel, offset * width, 0.05*height,page*width, .9*height,4)
		var fg = vec4(draggercolor.rgb, smoothstep(edge, -edge, field)*draggercolor.a)
		var bg = vec4(0.,0.,0.,0.05)
		//dump = field*0.1 + time
		return mix(bg.rgba, fg.rgba, fg.a)
	}
	
	this.vslider = function(){
		// we have a rectangle
		var rel = vec2(uv.x*width, uv.y*height)
		var edge = min(length(vec2(length(dFdx(rel)), length(dFdy(rel)))) * SQRT_1_2, 0.001)
		var field = shape.roundbox(rel, 0.05 * width, offset*height,.9*width, page*height,4)
		var fg = vec4(draggercolor.rgb, smoothstep(edge, -edge, field)*draggercolor.a)
		var bg = vec4(0.,0.,0.,0.05)
		return mix(bg.rgba, fg.rgba, fg.a)
	}

	this.bg = {
		draggercolor: vec4(),
		offset: 0,
		page: 0.3,
		color: this.vslider,
		col1: vec4("yellow"),
		col2: vec4("yellow")
	}
	
	this.render = function(){
		if (this.vertical){
			this.bg_shader.color = this.vslider
		}
		else {
			this.bg_shader.color = this.hslider
		}		
	}

	this.borderwidth = 0
	this.margin = 1
	this.bordercolor = vec4("#303060")
	
	this.pressed = 0
	this.hovered = 0
		
	this.mouseover  = function(){
		this.hovered++
		this.setDirty(true)
	}
	
	this.attribute("bgcolor", {duration: 1.0})
	
	this.mouseout = function(){
		this.hovered--
		this.setDirty(true)
	}
	
	this.mouseleftdown = function(start){
		this.pressed++
		this.setDirty(true)
		// detect if we clicked not on the button
		if(this.vertical){
			var p = start[1] / this.layout.height
		}
		else{
			var p = start[0] / this.layout.width
		}
		if(p < this.offset){
			var value = clamp(p - 0.5 * this.page, 0, 1.-this.page)
			if(value != this.offset){
				this.offset = value
				this.setDirty(true)
			}
		}
		else if (p > this.offset + this.page){
			var value = clamp(p - 0.5*this.page, 0, 1.-this.page)
			if(value != this.offset){
				this.offset = value
				this.setDirty(true)
			}
		}
		var start_offset = this.offset
		this.mousemove = function(pos){
			if(this.vertical){
				var p = start_offset + (pos[1] - start[1]) / this.layout.height
			}
			else{
				var p = start_offset + (pos[0] - start[0]) / this.layout.width
			}
			var value = clamp(p, 0, 1.-this.page)
			if(value != this.offset){
				this.offset = value
				this.setDirty(true)
			}
		}
	}
	
	this.mouseleftup = function(){
		this.pressed--
		this.mousemove = function(){}
		this.setDirty(true)
	}

	this.drawcount = 0;
	this.atDraw = function(){
		this.drawcount ++

		this.bg_shader._offset = this._offset
		this.bg_shader._page = this._page

	//	console.log("atdraw button", this.drawcount);
		if (this.pressed > 0){
				this.bg_shader._draggercolor = this.activecolor
		}
		else{
			if (this.hovered > 0){
				this.bg_shader._draggercolor = this.hovercolor
			}
			else{
				this.bg_shader._draggercolor = this.draggercolor
			}
		}
	}
})