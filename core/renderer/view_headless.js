// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
// Node worker baseclass

define.class('./view_base', function(require, exports, self){
	var node = require('$base/node')

	define.class(this, 'bg', function(node){})
	define.class(this, 'fg', function(node){})

	this.atConstructor = function(){
	}

	this.render = function(){
	}

	this.spawn = function(parent){
	}
})