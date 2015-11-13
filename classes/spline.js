/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(view, text, button, icon){

	// 4 point bezier curve defined by 4 points
	
	
	var spline = this.constructor;
	
	// Basic usage
	define.example(this, function Usage(){
		return [
			spline({p0:vec2(0,0), p1: vec2(100,0), p2:vec2(0,100), p3:vec2(100,100)})
		]
	});
	

	this.attribute("linewidth", {type: float, value: 5});
	this.attribute("linecolor1", {type: vec4, value: vec4(1,1,0,1)});
	this.attribute("linecolor2", {type: vec4, value: vec4(1,1,0,1)});
	
	this.attribute("p0", {type: vec2, value: vec2(100,0)});
	this.attribute("p1", {type: vec2, value: vec2(100,0)});
	this.attribute("p2", {type: vec2, value: vec2(0,100)});
	this.attribute("p3", {type: vec2, value: vec2(100,100)});
	this.attribute("off", {type: vec4, value: vec2(0,0,0,0)});
	
	
	
	this.vertexstruct = define.struct({
		pos: float,
		cap: float,
		side: float
	})

	this.bg = {


	
		draw_type: 'TRIANGLE_STRIP',	
		linewidth: 10.0,
		off: vec4(0),
		p0: vec2(0,0),
		p1: vec2(100,0),
		p2: vec2(0,100),
		p3: vec2(100,100),
		linecolor: vec4(1,1,1,1),
		linebordercolor: vec4(0,0,1,1),
		fromcol: vec4("red"),
		tocol: vec4("blue"),
		lineborderwidth: 1.8,
		
		color: function() {
			var hm = sin(mesh.side*PI+ PI/2)
			var borderval = clamp((abs(mesh.side)*(linewidth/2.0) -  ((linewidth/2.0) - lineborderwidth*2.0) ),0.0,1.0);			
			var col = mix(fromcol, tocol, mesh.pos) * (1 + sin(mesh.pos * PI)*0.2);					
			var col2 = mix(col, linebordercolor, borderval)
			return vec4(col2.rgb, col2.a * hm);		
		},

		shapefn: function(v) {
			return (sin(v)*.75+0.75)
		},
	
		scale: function() {
			return 4.5
		},
	
		mesh: this.vertexstruct.array(),
	
		position: function() {
			var npos = math.bezier2d(p0, p1, p2, p3, mesh.pos) - off;
			var rx = (npos.x + mesh.side * -npos.w * linewidth);
			var ry = (npos.y + mesh.side * npos.z * linewidth);
			return vec4(rx,ry, 0, 1) * matrix  * viewmatrix
		}
	}

	this.atDraw = function(){
		this.bg.linewidth = this._linewidth;
		this.bg.fromcol = this._linecolor1;
		this.bg.tocol = this._linecolor2;
		this.bg.p0 = this._p0;
		this.bg.p1 = this._p1;
		this.bg.p2 = this._p2;
		this.bg.p3 = this._p3;
		this.bg.off = this._off;
	}
	
	this.init = function(){
		this.time_start = Date.now()

		var strip = this.bg.mesh
		strip.length = 0
		var steps = 100

		for(var i = 0;i<steps;i++){
			var l1 = i / (steps - 1)//line[i];
			var cap = i==0? 0: i==steps -1? 0: 1
			strip.pushStrip(l1, cap, -0.5, l1, cap,  0.5)
		}
			
		
	}
})