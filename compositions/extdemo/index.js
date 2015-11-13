/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(composition, require, screens, desktop, devices, guide$search, syntax, this$index){

	function getSource(obj) {
		return obj.module.factory.body.toString();
	}

	this.render = function render() {

		return [
			// `compositions/guide/search.js` is used here
			guide$search({name:'search', keyword:"Aliens"}),
			screens(
				desktop({
					name:'desktop',
					syntaxCode:getSource(syntax),

					compositionCode:getSource(this$index),
					searchCode:getSource(guide$search),
					movies:'${this.rpc.search.results}',

					apiCode:getSource(devices),
					devices:'${this.rpc.devbus.active}'
				})
		    ),
			devices({name:'devbus'})
		]
	}
});