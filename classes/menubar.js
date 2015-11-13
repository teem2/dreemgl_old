/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(view, menuitem){
	// container class for menuitem instances
	this.bgcolor = vec4("lightgray" );	

	// render function passthrough
	this.render = function(){return this.constructor_children;}
	
	var menubar  = this.constructor;
	
	// Basic usage example
	define.example(this, function BasicUsage(){
		return [
			menubar({}
				,menuitem({text:"Menu 1"}
					,menuitem({text:"Item 1"})
					,menuitem({text:"Item 2", enabled: false})
					,menuitem({text:"Item 3"})
				
				)
				,menuitem({text:"Menu 2" }
					,menuitem({text:"Item 4"})
					,menuitem({text:"Item 5", enabled: false})				
				)
				,menuitem({text:"Button on the bar" })

			)
		]
	
	})
})