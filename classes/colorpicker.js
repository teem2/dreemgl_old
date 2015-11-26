/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function(view, label,button, scrollbar,require){
	
	
	var Shader = this.Shader = require('$draw/$drawmode/shader$drawmode')

		
	this.attributes =  {
		color: {type: vec4, value: "white"}
		,fgcolor: {type: vec4, value: "white"}		
		,fontsize:{type: int, value: 15}
		,internalbordercolor: {type:vec4, value:vec4(1,1,1,0.6)}
	}
	this.bgcolor = vec4(0.0,0.0,0.0,0.4)
	this.flexdirection = "column";
	this.padding = vec4(20)
	this.margin = vec4(10)
	this.borderradius = 8
	this.borderwidth = 2
	this.bordercolor = this.internalbordercolor
	this.internalbordercolor= function(){
		this.bordercolor = this.internalbordercolor		
	}
	define.class(this, 'colorcircle', this.Shader, function(){
		this.vertexstruct = define.struct({
			
			p:float,
			side: float
		})

		this.mesh = this.vertexstruct.array()
			this.draw_type = "TRIANGLE_STRIP"
	
		this.position = function(){
			uv = vec2(sin(mesh.p), cos(mesh.p))*mesh.side;
			off = mesh.p / 6.283
			var rad = min(view.layout.width, view.layout.height)/2;
			pos = vec2(view.layout.width/2 + rad * uv.x, view.layout.height/2 + rad * uv.y)
			return vec4(pos, 0, 1) * view.totalmatrix * view.viewmatrix
		}
		
		this.color = function(){
			return colorlib.hsla(vec4(off, 1, 0.5, 1));
		}
		
		this.update = function(){
			var view = this.view
			var width = view.layout?view.layout.width:view.width
			var height = view.layout?view.layout.height:view.height
			var cx = width/2;
			var cy = height/2;
			var radius = Math.min(cx,cy);
			this.mesh = this.vertexstruct.array()
			var cnt = 200;
			for (var i = 0;i<cnt;i++)
			{
				this.mesh.push(i*6.283/(cnt-1), 0.7);
				this.mesh.push(i*6.283/(cnt-1), 1);
			}
		}
			
		
	
	})
	
	this.color = function(aaaa){
		console.log(aaaa);
		
		this.settingcontrol = undefined;
	}
	
	define.class(this, 'colorarea', function(view){
		this.bg ={
			color:function(){
					return vec4(mesh.x, mesh.y,0,1);
				}
			};
		this.width = 100;
		this.height = 100;		
	})
	
	
	this.render = function(){
		return [
			view({flexdirection:"row", flex:1, bgcolor:"transparent"}
				,this.colorarea()
				,view({bg:this.colorcircle(), width:100,height:100})
				,view({flexdirection:"column", flex:1,bgcolor:"transparent"}
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"R", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,view({height:10, bg:{color:function(){return vec4(uv.x,0,0,1);}}})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})							
					)
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"G", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,view({height:10, bg:{color:function(){return vec4(0,uv.x,0,1);}}})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"B", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,view({height:10, bg:{color:function(){return vec4(0,0,uv.x,1);}}})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,view({height:10, bg:{color:function(){return colorlib.hsla(vec4(uv.x,1,0.5,1));}}})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,view({height:10, bg:{color:function(){return colorlib.hsla(vec4(0,1,uv.x,1));}}})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,view({height:10, bg:{color:function(){return colorlib.hsla(vec4(0,uv.x,0.5,1));}}})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
				)
			)
			
			,view({bgcolor:"transparent", justifycontent:"flex-end", flexdirection:"row", alignitems:"flex-end", flex:1}
				,view({margin:7,borderwidth:1, borderradius:8, bordercolor:this.internalbordercolor, bgcolor:"transparent", flex:1, padding:5}
					,label({margin:5,text:"hex:", bgcolor:"transparent", fgcolor:this.fgcolor, fontsize: this.fontsize})
					,label({ margin:5, text:"#ff00ff", bgcolor:"transparent", fgcolor:this.fgcolor, padding:vec4(20,2,2,2), fontsize: this.fontsize})
				)
				,view({margin:7,borderwidth:1, borderradius:8, bordercolor:this.internalbordercolor, bgcolor:"transparent", flex:1, padding:5}
					,label({margin:5,text:"alpha:", bgcolor:"transparent", fgcolor:this.fgcolor, fontsize: this.fontsize})
					,label({ margin:5, text:"ff", bgcolor:"transparent", fgcolor:this.fgcolor, padding:vec4(20,2,2,2), fontsize: this.fontsize})
				)
			)				
			,view({bgcolor:"transparent", justifycontent:"flex-end", flexdirection:"row", alignitems:"flex-end", flex:1}
				,button({text:"Cancel", alignself:"flex-end"})
				,button({text:"OK", alignself:"flex-end"})
			)
		]
		
	}
})