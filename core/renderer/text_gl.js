// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
// Sprite class

define.class('./view_gl', function(require, exports, self){	
	var GLText = require('$gl/gltext')
	var glfontParser = require('$gl/glfontparser')

	this.bgcolor = vec4("transparent");
	this.fgcolor = vec4("black");
	var text = this.constructor
	// A label.
	define.example(this, function Usage(){
		return [text({text:"I am a textlabel!", fgcolor:"purple", fontsize: 30 })]
	})
	
	// The string to display.
	this.attribute('text', {type:String, value: "HELLO" })
	
	// Size of the font in pixels
	this.attribute('fontsize', {type:float, value: 18});
	
	// Name of the font.
	this.attribute('font', {type:Object, value: undefined});
	
	this.attribute('color', {type:vec4, value: vec4(1,1,1,1)});

	// Should the text wrap around when its width has been reached?
	this.attribute('multiline', {type:Boolean, value: false })
	
	// Alignment of the bodytext. 
	// Accepted values are "left", "right", "justify" and "center" 
	this.attribute("align", {type: String,  value: "left"});
	
	define.class(this, 'fg', GLText, function(){
	})

	this.text = function(){
		this.dirty = true;
	}

	this.init = function(){
		if(this.font) this.font = glfontParser(this.font)
	}

	this.lazyInit = function(maxwidth){
		if(this.rendered_text !== this.text || this.lastmaxwidth !== maxwidth || this.align != this.lastalign){
			this.rendered_text = this.text
			this.lastmaxwidth = maxwidth;
			this.lastalign = this.align;
			
			var textbuf = this.fg_shader.newText()

			if(this.font) textbuf.font = this.font

			textbuf.fontsize = this.fontsize;
			textbuf.add_y = textbuf.line_height;
			textbuf.align = this.align;
			textbuf.start_y = textbuf.line_height
			textbuf.clear()
			if (this.multiline){
				textbuf.addWithinWidth(this.text, maxwidth? maxwidth: this.layout.width);
			}
			else{
				textbuf.add(this.text)
			}
			//this.fg.textcolor = this.color;
			this.fg_shader.mesh = textbuf
		}
	}

	this.sizetocontent = function(width){
		this.lazyInit(width)
		return {width: this.fg_shader.mesh.bound_w, height: this.fg_shader.mesh.bound_h};
	}

	this.atDraw = function(renderstate){
		this.fg_shader.viewmatrix = renderstate.viewmatrix;
		this.lazyInit()
	}
})