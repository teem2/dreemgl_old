/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function codeviewerbody(require, text){

	// Display a function as syntax highlighted code.
	
	// The code to display
	this.attribute("code", {type:String, value:""})
	
	this.attribute("wrap", {type:Boolean, value:true})
	
	var codeviewer = this.constructor
	
	// Basic usage
	define.example(this, function Usage(){
		return [codeviewer({bgcolor:"#000040", padding:vec4(14), code: "console.log(\"Hello world!\");"})]
	})
	
	var GLTextCode = require('$gl/gltextcode')	

	var Parser = require('$parsers/onejsparser')
//	this.font = require('$fonts/code_font1_ascii.glf')
	//this.bg = {color:undefined}
	this.fontsize = 14
	// syntax highlighting shader
	this.fg = function(){
		for(var key in GLTextCode.types){
			this[key] = String(GLTextCode.types[key])
		}

		this.paint = function(p,  dpdx, dpdy, edge){
			//var edge = min(length(dpx))
			//dump = edge
			var unicode = int(mesh.tag.x)
			var selected = mesh.tag.w

			if(unicode == 10){
				return vec4(0)
			}

			if(unicode == 32){
				if(selected < 0.){
					var w = .3
					var h = .13
					var field = shape.box(p, .5 - .5 * w, .5 - .5 * h, w, h)
					return vec4("#AF8F7E".rgb, smoothstep(.75 * edge, -.75 * edge, field))
				}
				return vec4(0)
			}

			if(unicode == 9){ // the screen aligned tab dots
				// make a nice tab line
				//var out = vec4(0)
				//dump = edge
				if(edge > 0.5){ // pixel drawing
					if(p.x > dpdx.x && p.x <= 3*dpdx.x && mod(p.y, 2.*dpdy.y) > dpdy.y) return '#445'
				}
				else { // switch to vector drawing
					var w = 1
					var h = 1
					var field = shape.box(mod(p, vec2(24*3, 3.)), .5 * w, 0, w, h)
					var col = vec4("#667".rgb, smoothstep(edge, -edge, field))
					if(col.a > 0.01) return col
				}

				if(selected < 0.){
					//if(edge > 0.02){
					//	if(p.x > 3. * dpdx.x && p.y >= .5 - .5 * dpdy.y && p.y <= .5 + .5 * dpdy.y)
					//		return vec4("#AF8F7E".rgb,1.)
					//	return vec4(0)
					//}
					var sz = .01
					var field = shape.line(p, 0., .5-sz, 1., .5-sz, 2.*sz)
					return vec4("#AF8F7E".rgb, smoothstep(edge,-edge,field))
				}
				return vec4(0)
			}
			return vec4(-1.)
		}

		this.style = function(pos){
			var group = mesh.tag.y
			var type = int(mesh.tag.z / 65536.)
			var sub = int(mod(mesh.tag.z / 256., 256.))
			var part = int(mod(mesh.tag.z, 256.))
			var unicode = int(mesh.tag.x)
			
			if(unicode == 10 || unicode == 32 || unicode == 9) discard
			if(sub == _Paren || sub == _Brace || sub == _Bracket){
				if(sub == _Paren){
					fgcolor = "white"
				}
				else if(sub == _Bracket){
					fgcolor = "#ccc"
				}
				else{
					fgcolor = "white"
				}
			}
			else if(sub == _Operator){
				fgcolor = "#ff9d00"
			}
			else if(type == _Id){
				fgcolor = "white"
				if(sub == _Color){
					fgcolor = "pink"
				}
			}
			else if(type == _Value){
				if(sub == _String)
					fgcolor = "#0f0"
				else
					fgcolor = "aero"
			}
			else if(type == _Comment){
				fgcolor = "#777"
			}
			else if(type == _This){
				fgcolor = "#ff7fe1"
			}else{
				fgcolor = "#ff9d00"
			}
			//if(type>7)mesh.outline = true
		}
	}

	this.code = codeviewerbody.toString()

	this.lazyInit = function(maxwidth){
		if(this.code !== this.printedcode || this.lastmaxwidth !== maxwidth || this.align != this.lastalign){
			this.printedcode = this.code
			this.lastmaxwidth = maxwidth
			this.lastalign = this.align
			
			var textbuf = this.fg_shader.newText()
			var ast = Parser.parse(this.code)

			if(this.font) textbuf.font = this.font

			textbuf.fontsize = this.fontsize
			textbuf.add_y = textbuf.line_height
			textbuf.align = 'left'
			textbuf.start_y = textbuf.line_height
			textbuf.boldness = 0.5
			textbuf.clear()
			if(this.wrap){
				var width = this.layout.width
				GLTextCode.walk(ast, textbuf, function(text, group, l1, l2, l3, m3){
					var indent = textbuf.font.glyphs[9].advance * textbuf.font_size * (this.indent)
					textbuf.addWithinWidth(text, maxwidth? maxwidth: width, indent, group, 65536 * (l1||0) + 256 * (l2||0) + (l3||0), m3)
				})
			}
			else{
				GLTextCode.walk(ast, textbuf, function(text, group, l1, l2, l3, m3){
					textbuf.add(text, group, 65536 * (l1||0) + 256 * (l2||0) + (l3||0), m3)
				})
			}

			//this.fg.textcolor = this.color;
			this.fg_shader.mesh = textbuf
		}
	}

})