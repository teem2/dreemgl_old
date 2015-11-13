// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


define.class(function(view, text, view, icon){
	// Simple button: a rectangle with a textlabel and an icon
	
	// The label for the button
	this.attribute("text", {type: String, value: ""});
	// The icon for the button, see FontAwesome for the available icon-names.
	this.attribute("icon", {type: String, value: ""});

	// Font size in device-pixels.
	// Example: example1
	this.attribute("fontsize", {type: float, value: 14});
	
	
	var button = this.constructor;
	
	// Basic usage of the button.	
	define.example(this, function Usage(){
		return [
			button({text:"Press me!"})
			,button({text:"Colored!", buttoncolor1: "red", buttoncolor2: "blue", labelcolor: "white"  })
			,button({text:"With an icon!", icon:"flask" })
		] 
	});
	
	// Color of the label text in neutral state	
	this.attribute("labelcolor", {type: vec4, value: vec4("#404040")});

	// Color of the label text in pressed-down state	
	this.attribute("labelactivecolor", {type: vec4, value: vec4("black")});
	
	// First gradient color for the button background in neutral state
	this.attribute("buttoncolor1", {type: vec4, value: vec4("#fffff0")});
	// Second gradient color for the button background in neutral state	
	this.attribute("buttoncolor2", {type: vec4, value: vec4("#ffffff")});
	
	// First gradient color for the button background in hovered state
	this.attribute("hovercolor1", {type: vec4, value: vec4("#f0f0f0")});
	
	// Second gradient color for the button background in hovered state
	this.attribute("hovercolor2", {type: vec4, value: vec4("#f8f8f8")});
	
	// First gradient color for the button background in pressed state
	this.attribute("pressedcolor1", {type: vec4, value: vec4("#d0d0f0")});
	
	// Second gradient color for the button background in pressed state
	this.attribute("pressedcolor2", {type: vec4, value: vec4("#d0d0f0")});
	
	this.buttonres = {};
		
	// the shader for the inside fill
	// <mesh> Texture coordinate from vertex (in 0,0 -> 1,1 space) 
	// <distance> Distance to outside border (in pixels) 
	this.buttonfill = function(mesh,distance){
		var fill = mix(col1, col2, (mesh.y)/0.8);
		return fill;
	}

	this.bg = {
		wobbleamount: 0.0,
		bgcolorfn: this.buttonfill,
		col1: vec4("yellow"),
		col2: vec4("yellow")
	}

	this.padding = 8;
	this.cornerradius = 3;
	this.borderwidth  = 2;
	this.margin = 4;
	this.bordercolor = vec4("lightgray");
	this.alignItems = "center";
	
	this.pressed = 0;
	this.hovered = 0;
		
	// The icon class used for the icon display. Exposed to allow overloading/replacing from the outside.
	define.class(this, 'icon_class', function(icon){
		
	})

	this.mouseover  = function(){
		this.hovered++;
		this.setDirty(true)
	}
	
	this.attribute("bgcolor", {duration: 1.0});
	
	this.mouseout = function(){
		if(this.hovered>0)this.hovered--;
		this.setDirty(true)
	}
	
	this.mouseleftdown = function(){
		this.pressed++
		this.setDirty(true)
	}
	
	this.mouseleftup = function(){
		this.pressed--;
		this.setDirty(true)
	}
	
	this.atDraw = function(){
		if (this.pressed > 0){
			this.bg_shader.col2 = this._pressedcolor2;
			this.bg_shader.col1 = this._pressedcolor1;
			this.buttonres.fgcolor = this._labelactivecolor;		
			
			if (this.iconres) this.iconres.fgcolor = this._labelactivecolor;
		} 
		else {
			if (this.hovered > 0){
				this.bg_shader.col2 = this._hovercolor2;
				this.bg_shader.col1 = this._hovercolor1;
				this.buttonres.fgcolor = this._labelactivecolor;
				if (this.iconres) this.iconres.fgcolor = this._labelactivecolor;
			} 
			else{
				this.buttonres.fgcolor = this._labelcolor;
				if (this.iconres) this.iconres.fgcolor = this._labelcolor;
				this.bg_shader.col2 = this._buttoncolor2;
				this.bg_shader.col1 = this._buttoncolor1;
			}
		}
	}

	this.render = function(){
		this.buttonres =  text({rotation: 0, bgcolor:"transparent",fgcolor:"white", marginleft: 4,fontsize: this.fontsize, position: "relative", text: this.text})
		if (!this.icon || this.icon.length == 0){
			this.iconres = undefined;
			return [this.buttonres];
		} else {
			this.iconres = this.icon_class({fontsize: this.fontsize,color:vec4('red'), icon: this.icon}); 
			return [this.iconres, this.buttonres];
		}
	}
	
})