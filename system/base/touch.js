/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(node){
	this.atConstructor = function(){}
	
	this.events = ['start', 'end', 'cancel', 'leave', 'move']
	this.attributes = {
		x: {type:int},
		y: {type:int},
		x1: {type:int},
		y1: {type:int},
		x2: {type:int},
		y2: {type:int},
		x3: {type:int},
		y3: {type:int},
		x4: {type:int},
		y4: {type:int},
		fingers: {type:int}
	}
})