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
	this.setHueBase = function(h)
	{
		this.basehue = h;
	}
	
	define.class(this, "customslider", function(view){
		this.height = 19;
		
		this.attributes = {
				
			// hsl color for the left side
			hslfrom:{type:vec3, value: vec3(0,1,0.5)},

			// hsl color for the right side
			hslto:{type:vec3, value: vec3(1,1,0.5)},
			
			
			
			// Color of the draggable part of the scrollbar
			draggercolor: {type: vec4, value: vec4("#9090b0")},

			// Color of the draggable part of the scrollbar
			draggerradius: {type: float, value: 3},
			
			// Color when the mouse is hovering over the draggable part of the scrollbar
			hovercolor: {type: vec4, value: vec4("#8080c0")},
			
			// Color of the draggable part of the scrollbar while actively scrolling
			activecolor: {type: vec4, value: vec4("#8080c0")},
			
			// Is this a horizontal or a vertical scrollbar? 
			vertical: {type: Boolean, value: false},
			
			// Current start offset of the scrollbar. Ranges from 0 to total - page
			offset: {type:float, value:0},
			
			// Page size, in total
			page: {type:float, value:25},

			// total size. 
			total: {type:float, value:256},


			// set animation on bgcolor
			bgcolor: {duration: 1.0}
		}

		var scrollbar = this.constructor;

		this.page = function(){
			this.redraw()
		}

		this.offset = function(){
			this.redraw()
		}

		var mesh = vec2.array()
		mesh.pushQuad(0,0,0,1,1,0,1,1)

		this.bg = {
			draggercolor: vec4(),
			offset: 0,
			page: 0.3,
		
			color: function(){
				// we have a rectangle
				var hlsamix = vec4(mix(view.hslfrom, view.hslto, mesh.x), 1.0)
				var bg =  colorlib.hsla(hlsamix);
			
			var rel = vec2(mesh.x*view.layout.width, mesh.y*view.layout.height)
				var offset = view.offset / view.total
				var page = view.page / view.total
				var edge = 0.1//min(length(vec2(length(dFdx(rel)), length(dFdy(rel)))) * SQRT_1_2, 0.001)
				var field = float(0)
				if(view.vertical){
					field = shape.roundbox(rel, 0.05 * view.layout.width, offset*view.layout.height,.9*view.layout.width, page*view.layout.height, view.draggerradius)
				}
				else{
					field = shape.roundbox(rel, offset * view.layout.width, 0.05*view.layout.height,page*view.layout.width, .9*view.layout.height, view.draggerradius)
				}
				var fg = vec4(view.draggercolor.rgb, smoothstep(-edge, edge, 2-abs(-field-1.))*view.draggercolor.a)
				//return vec4(vec3(sin(field)), 1.)
				return mix(bg.rgba, fg.rgba, fg.a)
			},
			mesh: mesh,
			update:function(){},
			position: function(){
				return vec4(mesh.x * view.layout.width, mesh.y * view.layout.height, 0, 1) * view.totalmatrix * view.viewmatrix
			}
		}

		this.borderwidth = 0
		this.margin = 1
		this.bordercolor = vec4("#303060")
		
		this.pressed = 0
		this.hovered = 0
			
		this.mouseover  = function(){
		}
		
		this.mouseout = function(){
		}
		
		this.mouseleftdown = function(start){
			// detect if we clicked not on the button
			if(this.vertical){
				var p = start[1] / this.layout.height
			}
			else{
				var p = start[0] / this.layout.width
			}
			var offset = this.offset / this.total
			var page = this.page / this.total
			if(p < offset){
				var value = clamp(p - 0.5 * page, 0, 1.-page) * this.total
				if(value != this.offset){
					this.offset = value
				}
			}
			else if (p > offset + page){
				var value = clamp(p - 0.5*page, 0, 1.-page) * this.total
				if(value != this.offset){
					this.offset = value
				}
			}
			var start_offset = offset//this.offset / this.total
			this.mousemove = function(pos){
				if(this.vertical){
					var p = start_offset + (pos[1] - start[1]) / this.layout.height
				}
				else{
					var p = start_offset + (pos[0] - start[0]) / this.layout.width
				}
				var value = clamp(p, 0, 1.-page) * this.total
				if(value != this.offset){
					this.offset = value
				}
			}
		}
		
		this.mouseleftup = function(){
			this.mousemove = function(){}
		}

		this.drawcount = 0;
	})

	
	define.class(this, 'colorcirclecontrol', function(view){
		this.width = 200;
		this.height = 200;
		this.attributes = {
			ringwidth:{type:float, value: 0.3},
			hover:{type:float, value: 0, motion:"linear", duration: 0.1}
		}
		this.mouseleftdown = function(){
			
			this.mousemove = function(m){
				var dx = m[0] - this.layout.width/2;
				var dy = m[1] - this.layout.height/2;
				dx /= this.layout.width/2;
				dy /= this.layout.height/2;
				var angle = Math.atan2(dy,dx);
				
				this.outer.setHueBase(-angle/ 6.283+ 0.25);
			};
		}
		this.mouseleftup = function(){
			this.mousemove = function(){};
		}
		this.mouseout = function(){
			if (this.overcount == 1) this.hover = 0;
			this.overcount--;
			if (this.overcount < 0) this.overcount = 0;
			if (this.overcount = 0) this.redraw();
			
		}
		this.mouseover = function(){
			if (this.overcount == 0) this.hover = 1;
			this.overcount++;
			this.redraw();
		}

		this.bg = function(){
			this.vertexstruct =  define.struct({		
				p:float,
				side: float
			})
			this.mesh = this.vertexstruct.array();
			this.draw_type = "TRIANGLE_STRIP";
		
		
			this.position = function(){
				uv = vec2(sin(mesh.p), cos(mesh.p))*(1-view.ringwidth + view.ringwidth*mesh.side);
				off = mesh.p / 6.283
				var rad = min(view.layout.width, view.layout.height)/2;
				pos = vec2(view.layout.width/2 + rad * uv.x, view.layout.height/2 + rad * uv.y)
				return vec4(pos, 0, 1) * view.totalmatrix * view.viewmatrix
			}
			this.color = function(){
				
				var edge = 1-pow(sin(mesh.side*3.1415),.40);
				//return vec4(view.hover, edge,0,1);
				
				var color = colorlib.hsla(vec4(off, 1, 0.5, 1));
				var edgecolor = vec4(1,1,1,1);
				
				return mix(color, edgecolor, view.hover*edge);;
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
				for (var i = 0;i<cnt;i++) {
					this.mesh.push(i*6.283/(cnt-1), 0);
					this.mesh.push(i*6.283/(cnt-1), 1);
				}
			}
		};	
		
	
	})
	
	define.class(this, 'triangleview', function(view){
		this.width = 200;
		this.height = 200;
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
				
				,view({width:200, height:200, bgcolor: "transparent"}
					,this.colorcirclecontrol({position:"absolute",width:200, height:200})
					,this.triangleview({basehue:this.basehue, position:"absolute"})
				)
				,view({flexdirection:"column", flex:1,bgcolor:"transparent"}
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"R", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,this.customslider({flex:1, hslfrom:vec3(0,1,0), hslto:vec3(0,1,0.5)})
							
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})							
					)
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"G", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,this.customslider({ flex:1, hslfrom:vec3(0.33,1,0), hslto:vec3(0.333,1,0.5)})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"B", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,this.customslider({height: 18, flex:1, hslfrom:vec3(0.666,1,0), hslto:vec3(0.666,1,0.5)})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
								,this.customslider({height: 18, flex:1, hslfrom:vec3(0.0,this.basesat,this.basel), hslto:vec3(1,this.basesat,this.basel)})
							)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
							,this.customslider({height: 18, flex:1, hslfrom:vec3(this.basehue,0,this.basel), hslto:vec3(this.basehue,1,this.basel)})
						)
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"255", fontsize:14, margin:4})			
					)			
					,view({bgcolor:"transparent", flexdirection:"row" }
						,label({fgcolor:this.fgcolor, bgcolor:"transparent" , text:"H", fontsize:14, margin:4})			
						,view({bgcolor:"transparent", flexdirection:"column", flex:1 }
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