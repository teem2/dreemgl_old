/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
define.class(function(view,  text, button, icon){
	// the treeview control - classic treeview with expandable nodes.
	
	var treeview = this.constructor;
	
	// Basic usage of the treeview control.
	define.example(this, function Usage(){
		return [treeview({dataset:{name:"root", children:[{name:"child1"}]}})]
	})
	// the dataset to use for tree expansion
	this.attribute("dataset", {type: Object, value:{}});
	
	// the current selected value	
	this.attribute("selected", {type: String, value:""});
	this.state('selected')

	// This event gets triggered when an item is selected.
	this.event('selectclick')

	// The fold button is a very very flat button. 
	define.class(this, 'foldbutton', function(button){
		this.borderwidth = 0
		this.padding =  0
		this.labelactivecolor = vec4("#303000")
		this.bordercolor= "transparent"
		this.buttoncolor1 =  vec4(1,1,1,0.0)
		this.buttoncolor2 =  vec4(1,1,1,0.0)
		this.pressedcolor1 = vec4(0,0,0,0.14)
		this.pressedcolor2 = vec4(0,0,0,0.05)
		this.hovercolor1 =   vec4(0,0,0,0.1)
		this.hovercolor2 =   vec4(0,0,0,0.1)
		this.cornerradius = 0
		this.fgcolor = "black"
		this.margin = 0
		this.bgcolor = "transparent"
		this.flex = undefined
		this.alignself = "flex-start" 	
	})

	// newitemheading combines a few foldbuttons in to a full "item" in the tree
	define.class(this, 'newitemheading', function(view){
		this.borderwidth = 0;
		this.attribute("folded", {type: boolean, value: false});
		this.padding =  0
		this.labelactivecolor = vec4("#303000")
		this.bordercolor= "transparent"
		this.buttoncolor1 = vec4(1,1,1,0.0)
		this.buttoncolor2 = vec4(1,1,1,0.0)
		this.pressedcolor1 = vec4(0,0,0,0.14)
		this.pressedcolor2 = vec4(0,0,0,0.05)
		this.hovercolor1 = vec4(0,0,0,0.1)
		this.hovercolor2 = vec4(0,0,0,0.1)
		this.cornerradius = 0
		this.fgcolor = "black"
		this.margin = 0
		this.bgcolor = "transparent"
		this.flex = undefined
		this.alignself = "flex-start"
		
		this.render = function(){
			return [
				this.haschildren?this.classroot.foldbutton({icon:this.folded?"arrow-right":"arrow-down",padding: 2,click: this.toggleclick}):[], 
				//flatbutton({icon:this.folded?"arrow-right":"arrow-down",padding: 2, click: this.toggleclick}),
				this.classroot.foldbutton({text: this.text, click:this.selectclick.bind(this)})
			];
		}
	});
	
	// the treeitem subclass contains 3 controls: a newitemheading, a set of treelines and an optional set of children treeitems in case the current node is expanded
	define.class(this, 'treeitem', function(view){

		this.flex = 1.0

		this.attribute("text", {type:String, value:""})

		this.padding = vec4(3)
		//this.attribute("collapsed", {type:Boolean, value:false});
		//this.bgcolor = vec4('red')
		this.fgcolor = vec4("black")

		this.flexdirection = "row"
		
		//this.attribute("fontsize", {type:float, value:12});
		
		this.attribute("item", {type:Object})

		// Open/close this node
		this.toggle = function(){
			if (this.item){
				if (!this.item.collapsed) this.item.collapsed = true
				else this.item.collapsed = false
				//this.collapsed = this.item.collapsed;
				this.reRender()
			}
			//this.reLayout();
			this.setDirty(true)
		}
		
		// build path for the current treeitem and call the classroot selectclick handler
		this.selectclick = function(){
			function walk(stack, node){
				if(stack === node) return [node]
				if(stack.children) for(var i = 0; i < stack.children.length; i++){
					var child = stack.children[i]
					var ret = walk(child, node)
					if(ret !== undefined){
						ret.unshift(stack)
						return ret
					}
				}
			}
			var path = walk(this.classroot.data, this.item)
			this.classroot.emit('selectclick', {item:this.item, path:path})
		}
		
		this.atConstructor = function(){
			if (this.item){
				if (!this.item.collapsed) this.item.collapsed = false
			}
			//	this.text = this.item.name;
		}
		
		this.count = 0;
		this.render = function(){
			//debugger;
			if (!this.item) return [text({text:"empty"})];
			//this.collapsed;
			//console.log("treeitem", this.item.name, this.item.children);
			return [view({flexdirection:"row", flex:1}, [
				view({bgcolor:"transparent", flexwrap:"none", flexdirection:"column" },
					this.classroot.newitemheading({haschildren:this.item.children&&this.item.children.length, folded: this.item.collapsed, toggleclick: this.toggle.bind(this), selectclick: this.selectclick.bind(this),text:this.item.name, id:this.item.id }),
					this.item.collapsed==false?
						view({bgcolor:"transparent",flexdirection:"row" },
							view({bgcolor:"transparent",  flexdirection:"column" , flex:1,  padding: 0 },
								this.item.children?
								this.item.children.map(function(m, i, array){return [
									view({bgcolor:"transparent",flexdirection:"row" , alignitems:"stretch", padding: 0},
										this.classroot.treeline({width:20,last:i === array.length - 1?1:0, bgcolor: "#c0c0c0" }), 
										this.classroot.treeitem({item: m})										
									)
									]}.bind(this))
								:[]
							)
						)
					:[]
				)
			])]
		}
	})
	
	// subclass to render the gridlines of the tree
	define.class(this, 'treeline', function(view){
		//this.bgcolor = vec4("red");
		this.flex = 1;
		this.alignself = "stretch"
		this.bg = {
			fgcolor: vec4(0.5, 0.5, 0.5, 1.),
			last: 0,
			bgcolorfn: function(a, b){
				var pos = uv.xy * vec2(width, height)
				var center = 18
				var left = 11
				var field = shape.union(
					shape.box(pos, left, 0., 1., height * (1. - last) + center * last),
					shape.box(pos, left, center, width, 1.)
				)
				var edge = 1.

				if(mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.) > 0.){
					return vec4(fgcolor.rgb, smoothstep(edge, -edge, field))
				}
				
				return vec4(fgcolor.rgb, 0)
			}
		}
		this.atDraw = function(){
			this.bg_shader.last = this.last
		}
	})
	
	this.bordercolor = vec4("gray");
	this.cornerradius = 0;
	this.clipping = true;
	this.bgcolor = vec4("white");

	this.bg = {
		bgcolorfn: function(a, b){
			return mix(bgcolor, bgcolor * 0.2, a.y * a.y);
		}
	}

	this.flexdirection = "row";
	this.flex = 1;

	this.alignself = "stretch" ;

	// the renderfunction for the treeview recursively expands using treeitem subclasses.
	this.render = function(){
		//var data;
		if (this.atBuildTree) this.data = this.atBuildTree(this.dataset.data)
		else{
			this.data = this.dataset.data
		}
		return [this.treeitem({item:this.data})]
	}
})