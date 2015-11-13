/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(view, text){
	// A fullscreen semitransparent overlay, for use under modal dialogs
	
	var screenoverlay = this.constructor;
	
	// Basic usage. Please note that this control should be used at a level high enough to actually cover the whole screen.
	define.example(this, function Usage(){
		return [screenoverlay()];
	});
	
	this.x = 0
	this.y = 0
	this.init = function(){
		this.size = this.screen.size;
	}
	this.position = "absolute";
	this.bg = {
		color:function(){return vec4(0,0,0,0.3);}
	}
})