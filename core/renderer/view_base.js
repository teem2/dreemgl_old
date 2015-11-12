// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Sprite class

define.class('$base/node', function(require, exports, self){

	this.attribute("bgcolor", {type:vec4, value: "white"})
	this.attribute("src", {type:String, value: ""})
	this.attribute("bordercolor", {type:vec4, value: "black"})

	this.attribute("pos", {type:vec2, value:vec2(0,0)})
	this.attribute("x", {storage:'pos', index:0})
	this.attribute("y", {storage:'pos', index:1})
	this.attribute("left", {storage:'pos', index:0})
	this.attribute("top", {storage:'pos', index:1})

	this.attribute("size", {type:vec2, value:vec2(NaN, NaN)})

	function percentParser(key, value){
		var special_key = 'percent_'+key
		if(typeof value === 'string'){
			if(value === 'auto'){
				this[special_key] = value
				return 0
			}
			else if(value.indexOf('%') == value.length - 1){
				this[special_key] = value
				return 0
			}
		}
		return value
	}
	
	this.attribute("w", {storage:'size', index:0, parser:percentParser})
	this.attribute("h", {storage:'size', index:1, parser:percentParser})
	this.attribute("width", {storage:'size', index:0, parser:percentParser})
	this.attribute("height", {storage:'size', index:1, parser:percentParser})

	this.attribute("right", {type:float, value: NaN})
	this.attribute("bottom", {type:float, value: NaN})
	
	this.attribute("opacity", {type:float, value: 1.0})
	this.attribute("rotation", {type:float, value: 0})

	this.attribute("cornerradius", {type:vec4, value: vec4(4,4,4,4)})
	this.attribute("cornerradiustopleft", {storage:'cornerradius', index:0})
	this.attribute("cornerradiusbottomleft", {storage:'cornerradius', index:1})
	this.attribute("cornerradiusbottomright", {storage:'cornerradius', index:2})
	this.attribute("cornerradiustopright", {storage:'cornerradius', index:3})
	
	this.attribute('minsize', {type: vec2, value: vec2(0,0)})
	this.attribute("minwidth", {storage:'minsize', index:0})
	this.attribute("minheight", {storage:'minsize', index:1})
	this.attribute('maxsize', {type: vec2, value: vec2(NaN, NaN)})
	this.attribute("maxwidth", {storage:'maxsize', index:0})
	this.attribute("maxheight", {storage:'maxsize', index:1})

	this.attribute("margin", {type: vec4, value: vec4(0,0,0,0)})
	this.attribute("marginleft", {storage:'margin', index:0})
	this.attribute("margintop", {storage:'margin', index:1})
	this.attribute("marginright", {storage:'margin', index:2})
	this.attribute("marginbottom", {storage:'margin', index:3})

	this.attribute("padding", {type: vec4, value: vec4(0,0,0,0)})
	this.attribute("paddingleft", {storage:'padding', index:0})
	this.attribute("paddingtop", {storage:'padding', index:1})
	this.attribute("paddingright", {storage:'padding', index:2})
	this.attribute("paddingbottom", {storage:'padding', index:3})

	this.attribute("borderwidth", {type: vec4, value: vec4(0,0,0,0)});
	this.attribute("borderleftwidth", {storage:'borderwidth', index:0})
	this.attribute("bordertopwidth", {storage:'borderwidth', index:1})
	this.attribute("borderrightwidth", {storage:'borderwidth', index:2})
	this.attribute("borderbottomwidth", {storage:'borderwidth', index:3})

	this.attribute("flex", {type: float, value: undefined});
	this.attribute("flexwrap", {type: String, value: "wrap"});	//'wrap', 'nowrap'
	this.attribute("flexdirection", {type: String, value: "row"});	//'column', 'row'
	this.attribute("justifycontent", {type:String, value: undefined}) //	'flex-start', 'center', 'flex-end', 'space-between', 'space-around'
	this.attribute("aligncontent", {type:String, value: undefined}) //	'flex-start', 'center', 'flex-end', 'space-between', 'space-around'
	this.attribute("alignitems", {type:String, value:"stretch"});  // 	'flex-start', 'center', 'flex-end', 'stretch'
	this.attribute("alignself", {type:String, value:undefined});  // 	'flex-start', 'center', 'flex-end', 'stretch'
	this.attribute("position", {type: String, value: "relative" });	//'relative', 'absolute'

	//this.attribute('fontsize', {type:float, value: 12});
	this.attribute('fgcolor', {type:vec4, value: vec4(1,1,1,1)});

	this.event("postLayout")

	this.event("click")
	this.event("dblclick")
	this.event("miss")
	this.event("mouseout")
	this.event("mouseover")
	this.event("mousemove")
	this.event("mouseleftdown")
	this.event("mouseleftup")
	this.event("mouserightdown")
	this.event("mouserightup")
	this.event("mousewheelx")
	this.event("mousewheely")

	this.event("keyup")
	this.event("keydown")
	this.event("keypress")
	this.event("keypaste")

	this.event("focusget")
	this.event("focuslost")
	
	this.calculateBoundingRect = function(){
		console.log("replace me!");
	}
	
	this.attribute("clipping", {type:boolean, value:false})
	
	this.init = function(){
		//if (this.screen) this.screen.addDirtyNode(this);
		this.setDirty();		
		if (this.screen) this.screen.requestLayout();
	}
	
	this.atDestroy = function(){
		if (this.screen) {
			this.screen.requestLayout();
			
		}
	}
	
	this.destroy = function(){
		if (this.screen){
			this.screen.addDirtyRect(this.getLastDrawnBoundingRect());
		}
	}
	
	this.bubbleDirty = function(){
		//if (this.dirty === false){
			this.dirty = true;
			if (this.parent) this.parent.bubbleDirty();
	//	}
	}
	this.setDirty = function(){		
	
		if (this.screen) 
		{
			if (this.screen.rendering === true) return;
			this.screen.addDirtyNode(this);
		}
		if (this.dirty === true) return;
		//console.log("dirty?");
		this.bubbleDirty();
		
	}
	
	this.pos = function(){
		if (!this.screen) return
		this.screen.addDirtyNode(this);
		if(this.position !== 'absolute'){
			this.screen.requestLayout();
		}
	}

	this.margin = this.padding = this.borderwidth = this.cornerradius = this.flex = this.flexdirection =  this.size = function(v){
		if (this.screen){
			this.screen.addDirtyNode(this);
			this.screen.requestLayout();
		}
	}
	
	this.reLayout = function(){
		if (this.screen) this.screen.requestLayout();
	}
	
	
})