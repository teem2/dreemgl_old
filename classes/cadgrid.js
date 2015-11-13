/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(view, text){
	// The CADGrid class provides a simple way to fill a frame with a classic engineering grid. 
	// todo:
	// - support zooming with incremental subdivision lines
	// - link up to 

	this.flex = 1;
	this.flexdirection = "column"
	this.alignitem = "stretch"
	this.alignself = "stretch"

	this.bgcolor = vec4("#d0d0d0")

	// CADGrid shader - used various floored modulo functions to find out if either a major or minor gridline is being touched.
	this.bg = {
		gridcolor:vec4("#ffffff"),	
		grid: function(a,b){
			if (floor(mod(a.x * width,50. )) == 0. ||floor(mod(a.y * height,50. )) == 0.)	{
				return mix(gridcolor, vec4(0.9,0.9,1.0,1.0), 0.5);
			}
			if (floor(mod(a.x * width,10. )) == 0. ||floor(mod(a.y * height,10. )) == 0.)	{
				return mix(gridcolor, vec4(0.9,0.9,1.0,1.0), 0.2);
			}
			return gridcolor;
		},
		bgcolorfn:function(a,b){
			return grid(a,b);
		}
	}

	var grid = this.constructor
	
	// Basic usage of the cadgrid
	define.example(this, function Usage(){
		return [
			grid({}, text({fgcolor: "black", bgcolor: "transparent", text:"I'm on a grid!" , margin: vec4(20)}))
		]		
	})
	
	// The CADGrid does not do anything to its children - plain passthrough
	this.render = function(){return this.constructor_children;}
	
	// Minimal usage example:
	this.example = function(){return cadgrid({width:100,height:100});};
})