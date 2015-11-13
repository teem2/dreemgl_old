// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
// Sprite class

define.class('./view_gl', function(require, exports, self){	
	define.class(this, 'fg', require('$gl/gltext'), function(){})
	define.class(this, 'cursor', require('$gl/glcursor'), function(){})
	define.class(this, 'marker', require('$gl/glmarker'), function(){})

	// lets require the keyhandling from edit
	this.mixin(require('$edit/editorimpl'))

	this.attribute('text', {type:String, value: "HELLO" })
	this.attribute('fontsize', {type:float, value: 18});
	this.attribute('color', {type:vec4, value: vec4(1,1,1,1)});
	this.attribute("markercolor", {type:vec4, value: vec4("gray")});
	this.attribute("markerfocuscolor", {type:vec4, value: vec4("ocea")});

	this.attribute("cursorcolor", {type:vec4, value: vec4("black")});
	
	var edit = this.constructor;
	
	// Basic usage of the edit control
	define.example(this, function Simple(){
		return [
			editor({text:"This is editable text!", bgcolor:"transparent" })
		]
	});
	
	this.bg = { 
		color: 'vec4(0.6)'
	}

	this.text = function(){
		this.dirty = true;
	}

	this.clearMarkers = function(){
		this.marker_shader.mesh.length = 0
	}

	this.clearCursors = function(){
		this.cursor_shader.mesh.length = 0
	}

	this.addMarkers = function(start, end){
		var markers = this.marker_shader.markergeom.getMarkersFromText(this.textbuf, start, end, 0)
		// lets add all markers
		for(var i = 0;i<markers.length;i++){
			this.marker_shader.mesh.addMarker(markers[i-1], markers[i], markers[i+1], this.textbuf.font_size, 0)
		}
	}

	this.addCursor = function(start){
		this.cursor_shader.mesh.addCursor(this.textbuf, start)
		this.setDirty(true)
	}

	this.init = function(){

		this.textbuf = this.fg_shader.newText()
		this.textbuf.font_size = this.fontsize;
		//this.textbuf.fgcolor = vec4('white')
		
		this.textbuf.start_y = this.fontsize
		this.textbuf.clear()
		this.textbuf.add(this.text)

		//this.cursors.moveRight()
		if(this.debug_shader){
			this.debug_shader.mesh = this.debug_shader.debuggeom.array()
			this.textbuf.debug_mesh = this.debug_shader.mesh
		}

		//console.log(this.textbuf.charCoords(0))
		this.fg_shader.mesh = this.textbuf

		this.cursor_shader = new this.cursor()
		this.marker_shader = new this.marker()

		this.cursor_shader.mesh = this.cursor_shader.cursorgeom.array()
		this.marker_shader.mesh = this.marker_shader.markergeom.array()
		this.initEditImpl()
		//this.cursors.moveRight()
		this.focus()
	}

	this.atDraw = function(){
		if(this.cursors.update) this.cursors.updateCursors()

		if(this.rendered_text !== this.text){
			this.rendered_text = this.text
			//this.fg.color = "'red'"
		}
	}

	this.doDraw = function(renderstate){
		//this.bg._matrix = renderstate.matrix
		this.bg_shader.width = this.textbuf.bound_w;
		this.bg_shader._viewmatrix = renderstate.viewmatrix;
		
		this.bg_shader.height = this.textbuf.bound_h
		this.bg_shader.draw(this.screen.device)
		
		this.marker_shader._matrix = this.bg_shader._matrix;
		this.marker_shader._viewmatrix = this.bg_shader._viewmatrix;

		if(this.hasfocus){
			this.marker_shader.fgcolor = this.markerfocuscolor;
		}
		else{
			this.marker_shader.fgcolor = this.markercolor;
		}
		this.marker_shader.draw(this.screen.device)

		if(this.hasfocus){
			this.cursor_shader._matrix = this.bg_shader._matrix
			this.cursor_shader._viewmatrix = this.bg_shader._viewmatrix

			this.cursor_shader.fgcolor = this.cursorcolor;
			
			this.cursor_shader.draw(this.screen.device)
		}
		this.fg_shader.viewmatrix = renderstate.viewmatrix;
		this.fg_shader.draw(this.screen.device)

		if(this.debug_shader){
			this.debug_shader._matrix = this.bg_shader._matrix
			this.debug_shader.draw(this.screen.device)
		}
	}

	this.tabstop = 1

	this.focusget = function(){
		this.hasfocus = 1
		this.setDirty(true)
	}

	this.focuslost = function(){
		this.hasfocus = 0
		this.setDirty(true)
	}

	this.doDrawGuid = function(renderstate){
		this.bg_shader.viewmatrix = renderstate.viewmatrix;
		this.bg_shader.width = this.textbuf.text_w
		this.bg_shader.height = this.textbuf.text_h
		this.bg_shader.drawGuid(this.screen.device)
	}

})