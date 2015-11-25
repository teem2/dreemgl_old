/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(require, shape3d, view, icon){
	// The classic Utah teapot - rebuilt from the original bezier patch set.
	
	if(define.$environment === 'nodejs') return

	this.attributes = {
		// Size of the teapot
		radius: {type:float, value:1},
		// Level of detail. 1 = cubic teapot, 10+ = very very smooth teapot.
		detail: {type:float, value:10}
	}
	
	this.radius = this.detail = function(){
		this.setDirty();
	}
	
	this.init = function(){
		this.bg_shader.addTeapot(this.radius, this.detail);
	}

})
