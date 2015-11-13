// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class('$base/node', function(require, exports, self){
	var AnimTrack = require('$animation/animtrack')

	this.init = function(){
		this.anims = {}
	}

	this.startMotion = function(obj, key, value){
		var config = obj.getAttributeConfig(key)
		var first = obj['_' + key]
		var trk = new AnimTrack(config, obj, key, first, value)
		var animkey = obj.interfaceguid + '_' + key
		this.anims[animkey] = trk
		obj.setDirty(true)
		return true
	}

	this.doAnimation = function(time){
		var hasanim = false
		for(var key in this.anims){
			var anim = this.anims[key]
			if(anim.start_time === undefined) anim.start_time = time
			var mytime = time - anim.start_time
			var value = anim.compute(mytime)
			if(value instanceof anim.End){
				delete this.anims[key] 
				//console.log(value.last_value)
				anim.obj.emit(anim.key, value.last_value)
				anim.obj.setDirty(true)
			}
			else{
				anim.obj.emit(anim.key, value)
				anim.obj.setDirty(true)
				if(!hasanim) hasanim = true
			}
		}

		return hasanim
	}
	this.event("postLayout")

	this.hideProperty(Object.keys(self))

	this.attribute("pos", {type:vec2, value:vec2(0,0)})
	this.attribute("x", {storage:'pos', index:0})
	this.attribute("y", {storage:'pos', index:1})
	this.attribute("left", {storage:'pos', index:0})
	this.attribute("top", {storage:'pos', index:1})

	this.attribute("bgcolor", {type:vec4, value: vec4(0,0,0.1,1)});
	this.attribute("size", {type:vec2, value:vec2(NaN, NaN)})

	this.attribute("w", {storage:'size', index:0})
	this.attribute("h", {storage:'size', index:1})
	this.attribute("width", {storage:'size', index:0})
	this.attribute("height", {storage:'size', index:1})

	this.attribute("margin", {type: vec4, value: vec4(0,0,0,0)});
	this.attribute("marginleft", {storage:'margin', index:0})
	this.attribute("margintop", {storage:'margin', index:1})
	this.attribute("marginright", {storage:'margin', index:2})
	this.attribute("marginbottom", {storage:'margin', index:3})

	this.attribute("padding", {type: vec4, value: vec4(0,0,0,0)});
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
	this.attribute("justifycontent", {type:String, value: ""}) //	'flex-start', 'center', 'flex-end', 'space-between', 'space-around'
	this.attribute("alignitems", {type:String, value:"stretch"});  // 	'flex-start', 'center', 'flex-end', 'stretch'
	this.attribute("alignself", {type:String, value:"stretch"});  // 	'flex-start', 'center', 'flex-end', 'stretch'
	this.attribute("position", {type: String, value: "relative" });	//'relative', 'absolute'

	this.attribute("model", {type: Object})
	this.state('model')
})