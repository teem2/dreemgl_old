// Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


define.class(function(view, button, text,screenoverlay){
	// menuitem provides standard "context menu" functionality, regularly found in menu's like the rightclick one. 
	// if the menuitem has children - these children shall be shown as a modal popup on click. If the click function has been overridden, this functionality will not fire.
	this.bgcolor = vec4("lightgray");
	
	this.attributes = {
		// enable/disable the button
		enabled: {type: boolean, value: true}
	}
	
	// the menuclick is the default handler for the button click. 
	this.menuclick = function(){
		// ok now we have to do a modal view of our constructor_children
		if(this.hasListeners('click')){
			this.screen.closeModal()
			this.emit('click')
			return
		}
		var br = this.getBoundingRect();
		this.screen.openModal(
			view({x:br.left, y:br.bottom, miss:function(){
				this.screen.closeModal(-1)
			}, position:'absolute', flexdirection:'column'},
			screenoverlay({x: -br.left}), 
			this.constructor_children)
		)
	}

	// Render the button. 
	this.render = function(){
		if (this.enabled)
		{
			return button({borderwidth: 0, padding: 4,labelactivecolor: vec4("#303000"), bordercolor:"transparent" , click:this.menuclick.bind(this), buttoncolor1:vec4(1,1,1,0.0),buttoncolor2:vec4(1,1,1,0.0),pressedcolor1:vec4(0,0,0,0.14), pressedcolor2:vec4(0,0,0,0.05),  hovercolor1:vec4(1,1,1,0.3),  hovercolor2:vec4(1,1,1,0.3), cornerradius: 0, text: this.text, margin: 0, bgcolor:"transparent"})
		}
		else{
			return text({
					borderwidth: 0, 
					margin: 4,
					fontsize: 14,
					padding: 4,
					marginleft: 4, 
					labelactivecolor: vec4("#303000"), 
					bordercolor:"transparent" ,
					buttoncolor1:vec4(1,1,1,0.0),
					buttoncolor2:vec4(1,1,1,0.0),
					pressedcolor1:vec4(0,0,0,0.14), 
					pressedcolor2:vec4(0,0,0,0.05),  
					hovercolor1:vec4(1,1,1,0.3),  
					hovercolor2:vec4(1,1,1,0.3), cornerradius: 0, text: this.text, fgcolor: "gray",  bgcolor:"transparent"})
		}
		//return button({text: this.text, fgcolor: "black", margin: 5, bgcolor:"transparent", click:this.myclick.bind(this) })
	}
})