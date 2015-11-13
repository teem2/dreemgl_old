// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

define.class(function(view, require){
	
	define.class(this, 'slide', function(view, text){
		this.cornerradius = vec4(10,10,10,10);
		this.borderwidth = 0;
		this.bordercolor = vec4("blue");
		this.bgcolor ="white";
		this.flex = 1;
		this.padding= vec4(6);
		this.render = function(){
			return view({bg:{bgcolorfn:function(a,b){return vec4(1- a.y*0.4, 1- a.y*0.4,1- a.y*0.2,1);}}, cornerradius:vec4(10),flex:1,flexdirection:'column'}
				,text({margin:[10,10,10,10],fontsize:50,alignself:'center',text:this.title})
				,view({flex:1, bgcolor:"transparent", padding:vec4(10)},this.constructor_children)
			)
		}
	});

	// lets put an animation on x
	this.attribute('x', {motion:'inoutsine',duration:0.2})

	this.attribute('page',{type:int})

	this.page = function(){
		this.x = -this.page * (this.slidewidth + this.slidemargin * 2)
	}

	this.state('pos')
	this.state('page')

	this.constructor.slide = this.slide

	this.slidewidth = 1024
	this.slidemargin = 10
	this.slideheight = 1024
	this.page = 0
	this.keydown = function(key){

		// alright we have a keydown!
		if(key.name == 'leftarrow'){
			// we need to animate to the left
			if(this.page >0) this.page --
		}
		else if(key.name == 'rightarrow'){
			// animate to the right
			if(this.page < this.constructor_children.length-1)this.page++
		}
	}

	// deny focus loss
	this.focuslost = function(){
//		this.screen.setFocus(this)
	}

	this.init = function(){
		this.screen.setFocus(this)
	}

	this.render = function(){
		// ok lets render all our slides using our container slide
		var count = 0
		return this.constructor_children.map(function(item){
			count++
			return this.slide({flexdirection:'column',width:this.slidewidth,margin:this.slidemargin,height:this.slideheight,title:item.slidetitle}, item)
		}.bind(this))
	}
})