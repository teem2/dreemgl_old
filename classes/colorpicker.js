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
		,basehue: {type:float, value:0.5}
		,basesat: {type:float, value:1}
		,basel: {type:float, value:0.5}
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
	
	
	define.class(this, 'customslider',  function(view){
		this.flex = 1;
		this.height = 19;
		this.bgcolor = vec4("blue");
		this.attributes ={		
			hslfrom:{type:vec3, value: vec3(0,1,0.5)}
			,hslto:{type:vec3, value: vec3(1,1,0.5)}
			}
		define.class(this, 'bg', this.Shader, function(){
			this.vertexstruct = define.struct({		
				p:vec2,
				uv:vec2,
				side: float
			})	
			
			this.update = function(){
				var view = this.view
			
				var mesh = this.mesh = this.vertexstruct.array()
				var width = view.layout?view.layout.width:view.width
				var height = view.layout?view.layout.height:view.height
			
				mesh.push(0,0,0,0,0);
				mesh.push(width,0,1,0,0);
				mesh.push(0,height,0,1,1);
				mesh.push(width,height,1,1,1);
			
			}
			
			this.mesh = this.vertexstruct.array()
			this.draw_type = "TRIANGLE_STRIP"
			
			this.position = function(){
				return vec4(mesh.p.x,mesh.p.y, 0, 1) * view.totalmatrix * view.viewmatrix
			}
			
			this.color = function(){				
				var hlsamix = vec4(mix(view.hslfrom, view.hslto, mesh.uv.x), 1.0)
				return colorlib.hsla(hlsamix);
			}
		})
	
	})
	
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
			var cnt = 100;
			for (var i = 0;i<cnt;i++)
			{
				this.mesh.push(i*6.283/(cnt-1), 0.7);
				this.mesh.push(i*6.283/(cnt-1), 1);
			}
		}
			
		
	
	})
	
	define.class(this, 'triangleview', function(view){
		this.width = 300;
		this.height = 300;
		this.attributes = {
			basehue: {type:float, value:0.7}
		}
		define.class(this, 'bg', this.Shader, function(){
		
		this.vertexstruct = define.struct({		
			p:float,			
			hsloff: vec3	
		})
		
		this.mesh = this.vertexstruct.array()
		this.draw_type = "TRIANGLES"
	
		this.position = function(){
			off = mesh.p / 6.283
			var rad = min(view.layout.width, view.layout.height)/2;
			uv = vec2(sin(mesh.p * PI * 2), cos(mesh.p* PI * 2)) * 0.7;
			pos = vec2(view.layout.width/2 + rad * uv.x, view.layout.height/2 + rad * uv.y)
			return vec4(pos, 0, 1) * view.totalmatrix * view.viewmatrix
		}
		
		this.color = function(){
			var hsl = vec3(view.basehue,1,0.5) + mesh.hsloff;
			return colorlib.hsla(vec4(hsl, 1));
		}
		
		this.update = function(){
			var view = this.view
			var width = view.layout?view.layout.width:view.width
			var height = view.layout?view.layout.height:view.height
			var cx = width/2;
			var cy = height/2;
			var radius = Math.min(cx,cy);
			this.mesh = this.vertexstruct.array()
			this.mesh.push(view.basehue,  vec3(0,0,0));
			this.mesh.push(view.basehue + 1/3,  vec3(0,-1,-0.5));
			this.mesh.push(view.basehue + 2/3, vec3(0,-1,0.5));
			
		}				
	})
	
	})
	
	this.colorcircle = 0;
	this.colortriangle = 0;
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
				,view({width:300, height:300, bgcolor: "transparent"}
					,view({bg:this.colorcircle, position:"absolute",width:300, height:300})
					,this.triangleview({basehue:this.basehue, position:"absolute"})
				)
				,view({flexdirection:"column", flex:1,bgcolor:"transparent"}
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"R", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,this.customslider({flex:1, hslfrom:vec3(0,1,0), hslto:vec3(0,1,0.5)})
							
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})							
					)
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"G", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})	
							,this.customslider({ flex:1, hslfrom:vec3(0.33,1,0), hslto:vec3(0.333,1,0.5)})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"B", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,this.customslider({height: 18, flex:1, hslfrom:vec3(0.666,1,0), hslto:vec3(0.666,1,0.5)})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
								,this.customslider({height: 18, flex:1, hslfrom:vec3(0.0,this.basesat,this.basel), hslto:vec3(1,this.basesat,this.basel)})
							)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,this.customslider({height: 18, flex:1, hslfrom:vec3(this.basehue,0,this.basel), hslto:vec3(this.basehue,1,this.basel)})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,scrollbar({height:18, total:255, page:20, vertical:false})
							,this.customslider({height: 18, flex:1, hslfrom:vec3(this.basehue,this.basesat,0), hslto:vec3(this.basehue,this.basesat,1)})
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