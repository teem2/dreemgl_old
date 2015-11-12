// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

// ruler class

define.class(function(view, text){
	// the ruler shows a sideline every N ticks.
	
	this.attributes = {
		// vertical or horizontal ruler.
		vertical: {type:Boolean, value:false},
		
		// first "range" label
		from: {type:Number, value: 100},
		
		// second "range" label
		to: {type:Number, value: 200},
		
		// where to start counting - the first "offset" pixels will be ignored.
		offset: {type:Number, value: 20}
	}

	var ruler = this.constructor;
	
	// Basic usage
	define.example(this, function Usage(){
		return [
			ruler({from: 10, to: 150, height: 40})
		];
	})
	
	// horizontal ruler shader
	this.hruler = function(){
		var dist =(uv.x *	width) - offset;
		if (dist > 0.){ 
			if(floor(mod(dist  ,100.) ) < 1.) {
				return vec4(0.8,0.8,0.8,1);	
			}else{
				if (uv.y >0.5 && floor(mod(dist ,10.) ) < 1.) {
					return vec4(0.75,0.75,0.75,1.0);
				}
			}
		}
		return bgcolor
	}
	
	// vertical ruler shader
	this.vruler = function(){
		var dist =(uv.y *	height) - offset;
		if (dist > 0.)	{ 		
			if (floor(mod(dist ,100.) ) < 1.) {
				return vec4(0.8,0.8,0.8,1);
			}else{
				if (uv.x >0.5 && floor(mod(dist ,10.) ) < 1.) {
					return vec4(0.75,0.75,0.75,1.0);
				}
			}
		}
		return bgcolor
	}
		
	this.bgcolor = "#8080b0"
	this.flexdirection = "column"
	this.alignself = "stretch"
		
	this.render = function(){
		if (this.vertical == false){
			this.bg_shader.color = this.hruler
			this.bg_shader.offset = this.offset			
						
			var rulerres = [];
			if (this.from) rulerres.push(text({position: "absolute", text: this.from.toString(),width:100,height:20, bgcolor:"transparent", left: this.from+this.offset}));
			if (this.to) rulerres.push(text({position: "absolute", text: this.to.toString(),width:100,height:20, bgcolor:"transparent", left: this.to+this.offset}));
				
			return rulerres
		}
		else{
			this.bg_shader.color = this.vruler
			this.bg_shader.offset = this.offset			
	
			var rulerres = [];
			if (this.from) rulerres.push(text({rotation: -90, bgcolor:"transparent",width: 100, height: 20,position: "absolute", text: this.from.toString(), left:-45,top: this.from+this.offset}));
			if (this.to) rulerres.push(text({rotation: -90, bgcolor:"transparent",width: 100, height: 20,position: "absolute", text: this.to.toString(), left:-45,top: this.to+this.offset}));
			return rulerres;
		}
	}
})