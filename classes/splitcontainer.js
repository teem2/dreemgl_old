/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(view, text){
	// splitcontainer adds dragbars between nodes to make all the nodes resizable. 
	
	// should the splitter bars be introduced horizontally or vertically? 
	this.attribute("vertical", {type: Boolean, value: true});
	
	this.attribute("splitsize", {type: float, value: 8});
	this.attribute("minimalchildsize", {type: float, value: 20});
	this.attribute("splittercolor", {type: vec4, value: vec4("#404050")});
	this.attribute("hovercolor", {type: vec4, value: vec4("#5050a0")});
	this.attribute("activecolor", {type: vec4, value: vec4("#7070a0")});

	this.flex = 1.0;
	this.flexdirection = this.vertical?"column":"row" ;
	this.position = "relative" ;
	this.borderwidth =1;
	this.bordercolor = vec4("#303060");
	
	this.vertical = function(){
		this.flexdirection = this.vertical?"column":"row" ;
	}
	
	var splitcontainer = this.constructor;
	
	// Basic usage of the splitcontainer
	define.example(this, function Usage(){ return [
								splitcontainer({vertical: false, margin: 4, flex: 1.0, borderwidth:2, bordercolor: "darkblue", padding: vec4(2) },
								text({flex: 0.2, fontsize: 26, text:"A", bgcolor: "transparent" ,multiline: true, align:"center" , fgcolor:"black", margin: 2})
								,text({flex: 0.2, fontsize: 26, text:"B", bgcolor: "transparent" ,multiline: true, align:"center" ,fgcolor:"black", margin: 2})
								,text({flex: 0.2, fontsize: 26, text:"C", bgcolor: "transparent" ,multiline: true, align:"center" , fgcolor:"black",margin: 2})
								,text({flex: 0.2, fontsize: 26, text:"D", bgcolor: "transparent" ,multiline: true, align:"center" , fgcolor:"black",margin: 2})
		)]});

	
	// the visual class that defines the draggable bar between the resizable children
	define.class(this, 'splitter', function(view){
		
		this.attribute("firstnode", {type: int, value: 0});
	
		this.bgcolor = vec4("gray");
		this.alignitem = "stretch";
		this.attribute("vertical", {type: Boolean, value: false});
		this.attribute("splitsize", {type: float, value: 10});
		this.attribute("splittercolor", {type: vec4, value: vec4("#404050")});
		this.attribute("hovercolor", {type: vec4, value: vec4("#5050a0")});
		this.attribute("activecolor", {type: vec4, value: vec4("#7070a0")});
		this.bg = {color1: vec4("red"), bgcolorfn: function(A,B){return color1;}};
		this.pressed = 0;
		this.hovered = 0;

		this.mouseover  = function(){
			if (this.hovered < 1) this.hovered++;
			this.setDirty(true);
		}

		this.mouseout  = function(){
			if (this.hovered>0)	this.hovered--;
			this.setDirty(true);
		}

		this.mouseleftdown = function(pos){
			this.pressed++;
			this.dragstart = {x: this.screen.mouse.x, y:this.screen.mouse.y};
			
			this.flexstart = 
				{
					left: this.parent.children[this.firstnode].flex, 
					right: this.parent.children[this.firstnode+2].flex,
					
					leftwidth: this.parent.children[this.firstnode].layout.width, 
					leftheight: this.parent.children[this.firstnode].layout.height,
					
					rightwidth: this.parent.children[this.firstnode+2].layout.width,
					rightheight: this.parent.children[this.firstnode+2].layout.height
				};

			this.mousemove = function(a){				
				var dx = this.screen.mouse.x - this.dragstart.x;
				var dy = this.screen.mouse.y - this.dragstart.y;
				
				var leftnode = this.parent.children[this.firstnode];
				var rightnode = this.parent.children[this.firstnode+2];

				var f1 = this.flexstart.left;
				var f2 = this.flexstart.right;

				var totf = f1 + f2;

				if (this.vertical){
					var h1 = this.flexstart.leftheight;
					var h2 = this.flexstart.rightheight;
					
					var hadd = h1 + h2;	
					h1 += dy;
					h2 -= dy;
					if (h1 < this.parent.minimalchildsize || h2 < this.parent.minimalchildsize) return;
					var f1n = h1 / (hadd);
					var f2n = h2 / (hadd);					
					leftnode.flex = f1n * totf;
					rightnode.flex = f2n* totf;
				}else{										
					var w1 = this.flexstart.leftwidth;
					var w2 = this.flexstart.rightwidth;
					
					var wadd = w1 + w2;
					w1 += dx;
					w2 -= dx;
					if (w1 < this.parent.minimalchildsize || w2 < this.parent.minimalchildsize) return;
					var f1n = w1 / (wadd);
					var f2n = w2 / (wadd);
					leftnode.flex = f1n* totf;
					rightnode.flex = f2n* totf;
				}
				leftnode.setDirty(true);
				leftnode.reLayout();
				rightnode.reLayout();
				rightnode.setDirty(true);
				this.setDirty(true);
			}.bind(this);

			this.setDirty(true);
		}

		this.mouseleftup = function(){
			this.pressed--;
			this.mousemove = function(){};
			this.setDirty(true);			
		}

		this.atDraw = function(){
			if (this.hovered > 0){
				if (this.pressed > 0){
					this.bg_shader.color1 = this.activecolor;
				}else{
					this.bg_shader.color1 = this.hovercolor;
				}
			}else{
				this.bg_shader.color1 = this.splittercolor;
			}
		}

		this.render = function(){
			if (this.vertical){
				this.height = this.splitsize;
				this.width = NaN;
			}else{
				this.width = this.splitsize;;
				this.height = NaN;
			}				
		}		
	});
	
	this.render = function(){		
		if (this.constructor_children.length > 1){
			this.newchildren = []
			this.newchildren.push(view({clipping: true, flex: this.constructor_children[0].flex},this.constructor_children[0]));
			for (var i = 1;i<this.constructor_children.length;i++){
				this.newchildren.push(this.splitter({vertical: this.vertical,firstnode: (i-1)*2, splitsize: this.splitsize, splittercolor: this.splittercolor, hovercolor: this.hovercolor, activecolor: this.activecolor}));
				this.newchildren.push(view({clipping: true, flex: this.constructor_children[i].flex },this.constructor_children[i]));				
			}
			this.children = [];
			return this.newchildren;
		}else{
			return this.constructor_children;
		}
	}
});