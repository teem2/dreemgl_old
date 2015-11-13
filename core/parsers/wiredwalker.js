/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
// Acorn binding walker

define.class("$parsers/onejsgen", function(require, exports, self){

	self.newState = function(){
		return {
			depth:"",
			references:[]
		}
	}

	self.Index = function(node, parent, state){
		if(!state.expr || node.index.type !== 'Value') throw new Error("Cannot property bind to dynamic index")
		state.expr.unshift(node.index.value)
	
		return this.expand(node.object, node, state) + '[' + node.index.value + ']'
	}

	self.Key = function(node, parent, state){
		// ok we are a member expression
		
		if(state.expr) state.expr.unshift(node.key.name)
		else {
			state = Object.create(state)
			state.expr = [node.key.name]
			if(parent.type !== 'Call' || parent.fn !== node){
				state.references.push(state.expr)
			}
		}
		return this.expand(node.object, node, state) + '.' + node.key.name
	}

	self.This = function(node, parent, state){
		if(state.expr) state.expr.unshift('this')
		return 'this'
	}

	self.Id = function(node, parent, state){
		if(state.expr) state.expr.unshift(node.name)
		return node.name
	}
	
	self.Value = function(node, parent, state){
		return node.raw
	}	
})
