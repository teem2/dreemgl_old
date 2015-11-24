/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(composition, require, screens, screen, devices, guide$search, syntax, this$index, slideviewer, this$slides$intro, this$slides$diagram, this$slides$internal, this$slides$external, this$slides$api, this$slides$resources){

	function getSource(obj) {
		return obj.module.factory.body.toString();
	}

	this.render = function render() {

		return [
			// `compositions/guide/search.js` is used here
			guide$search({name:'search', keyword:"Aliens"}),
			screens(
				screen({name:'desktop'},
					slideviewer(
						{name: 'slides', slideheight: 800, position: 'absolute', x: 0, bgcolor: 'black'},
						this$slides$intro({
							flex:1,
							syntaxCode:getSource(syntax)
						}),
						this$slides$diagram({flex: 1}),
						this$slides$internal({
							flex: 1,
							movies:'${this.rpc.search.results}',
							searchCode:getSource(guide$search),
							compositionCode:getSource(this$index)
						}),
						this$slides$external({
							flex: 1,
							apiCode:getSource(devices),
							devices:'${this.rpc.devbus.active}'
						}),
						this$slides$api({flex: 1}),
						this$slides$resources({flex: 1})
					)
				)
		    ),
			devices({name:'devbus'})
		]
	}
});