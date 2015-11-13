/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(require, cadgrid){
	
	// Load a composition in to a frame without any mouse interaction. Usable for editor construction
	
	this.init = function(){
		// we need to map 'screen' to something else
		define.atLookupClass = function(cls){
			if(cls === 'screen'){ // remap our screen class
				return '$renderer/screen_edit'	
			}
			return define.lookupClass(cls)
		}

		require.async('/compositions/' + this.subcomposition + '/index.js').then(function(TeemClient){
			define.atLookupClass = define.lookupClass
			// alright lets load this thing up
			this.sub_teem = new TeemClient(undefined, this)
			this.sub_teem.screen.flex = 1;
			this.sub_teem.screen.alignself = "stretch";
			
			this.children = [this.sub_teem.screen]

			this.setDirty(true)
			this.reLayout()
		}.bind(this))
	}

	this.atDraw = function(){
		// alright now we need to draw the things in our sub_teem
		// screen.
		if(!this.sub_teem) return
	}
})