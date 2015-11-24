/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(view, label,button){
	
	this.attributes =  {
		color: {type: vec4, value: "white"}
	}
	
	this.bgcolor = vec4("#d0d0d0")
	this.flexdirection = "column";
	this.padding = vec4(10)
	this.margin = vec4(10)
	
	
	
	this.render = function(){
		
		return [
			
			label({text:"Select Color", bgcolor:"transparent", fgcolor:"black", fontsize: 10})
			,label({margin:5, text:"#ff00ff", bgcolor:"#303030", fgcolor:"white", padding:vec4(20,2,2,2), fontsize: 16})
			,view({margin:5, bg:{color:function(){return vec4(mesh.x, mesh.y,0,1);}}, width:200, height:200})
			,view({bgcolor:"transparent", flexdirection:"row", aligncontent:"flex-end", flex:1, borderwidth:vec4(5,5,5,5), bordercolor:"black", borderradius:0}
				,button({text:"Cancel", alignself:"flex-end"})
				,button({text:"OK", alignself:"flex-end"})
			)
		]
		
	}
})