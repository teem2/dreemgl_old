/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(require, shape3d){

	this.attributes = {
		radius: {type:float, value:0.5},
		xdiv: {type:int, value:40},
		ydiv: {type:int, value:40}
	}

	this.init = function(){
		this.bgshader.setSphere(this.radius, this.xdiv, this.ydiv);
	}
})
