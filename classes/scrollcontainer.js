// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(view, scrollbar){

	// The scrollcontainer wraps all its children in a movable frame with 2 scrollbars around it.
	
	this.flexdirection = "column" ;
	this.flexwrap = "none" ;
	this.alignitems = "stretch";
	this.flex = 1;

	
	var scrollcontainer = this.constructor;
	
	// Basic usage of the scrollcontainer
	define.example(this, function Usage(){
			return [
				scrollcontainer({height: 300, width: 300}
					,view({x: 0, y:0, position: "absolute", width:50, height: 50, bgcolor:"green"})
					,view({x:400, position: "absolute", width:50, height: 50, bgcolor:"red"})
					,view({y:400, position: "absolute", width:50, height: 50, bgcolor:"blue"})
					,view({x:400, position: "absolute", y:400, width:50, height: 50, bgcolor:"yellow"})
				)
			]
		}
	)
	
	// Pixelsize of the scrollbars
	this.attribute("scrollbarwidth", {type: int, value: 16});
	
	// Is the horizontal scrollbar visible? 
	this.attribute("hscrollvisible", {type: boolean, value: true});
	
	// Is the vertical scrollbar visible? 	
	this.attribute("vscrollvisible", {type: boolean, value: true});
	
	// Background color of the movable inside view. 
	this.attribute("move_view_bgcolor", {type: vec4, value: vec4("white")});
	
	// Scrollwheel handler to move horizontally
	// <value> the amount scrolled by
	this.mousewheelx = function(value){
		if(this.hscroll && this.mouse_height){
			var off = this.hscroll.offset
			off = clamp(off + value / this.mouse_width, 0, 1 - this.hscroll.page)
			if(off !== this.hscroll.offset) this.hscroll.offset = off
		}
	}

	// Scrollwheel handler to move vertically
	// <value> the amount scrolled by
	this.mousewheely = function(value){
		if(this.vscroll && this.mouse_height){
			var off = this.vscroll.offset
			off = clamp(off + value / this.mouse_height, 0, 1 - this.vscroll.page)
			if(off !== this.vscroll.offset) this.vscroll.offset = off
		}
	}

	// Recalculate the size of the scrollbar draggers
	// <view> the view-derived class to measure
	this.updatescrollbars = function(view){
		var rect = view.getUnclippedBoundingRect()
		if(this.vscroll){
			if(view.layout.height >= rect.height){
				this.vscroll.page = 1
			}
			else{
				this.vscroll.page = view.layout.height / rect.height
				this.scaled_height = (rect.height - view.layout.height + this.scrollbarwidth) / (1 - this.vscroll.page)
				this.mouse_height = rect.height
			}
		}
		if(this.hscroll){
			if(view.layout.width >= rect.right){
				this.hscroll.page = 1
			}
			else{
				this.hscroll.page = view.layout.width / rect.right
				this.scaled_width = (rect.right - view.layout.width + this.scrollbarwidth) / (1 - this.hscroll.page)
				this.mouse_width = rect.bottom
			}
		}
	}

	this.render = function(){		
		if (this.constructor_children.length === 0) return []
		var pthis = this
		return [
			view({flexdirection :"row", flex: 1 },
				view({bgcolor: "#c0c0c0",  clipping:false, flex:1},
					view({bgcolor: this.move_view_bgcolor,  clipping:true, flex:1, alignself: "stretch",  margin: 0,
						postLayout:function(){
							this.move_view.width = this.layout.width;
							pthis.updatescrollbars(this)
						}.bind(this)},
						this.move_view = view({position:'absolute',bgcolor: this.move_view_bgcolor, flex:1}, 
							this.constructor_children
						)
					)
				),
				this.vscrollvisible && (this.vscroll = scrollbar({width:this.scrollbarwidth, offset:function(){
					var val = this.offset * pthis.scaled_height * -1
					//debugger
					pthis.move_view.y = val
					//console.log(this.offset)
				}}))	
			),
			view({flexdirection :"row" },
				this.hscrollvisible &&	(this.hscroll = scrollbar({vertical:false, height:this.scrollbarwidth, flex:1, offset:function(){
					pthis.move_view.x = this.offset * pthis.scaled_width * -1
				}})),
				view({width:this.scrollbarwidth})
				
			)
		]
	}
})
