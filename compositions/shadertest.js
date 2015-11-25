//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button, cube, splitcontainer){
	this.render = function(){ return [
		screens(
			screen({clearcolor:vec4('black')},
				view({
					flex:1,
					bgcolor:'white',
					borderradius:20,
					flexdirection:'column',
					padding:30,
					},
					label({text:'Live shader coding', fontsize: 38, marginbottom:20, fgcolor:'black'}),
					view({
						flex:1,
						bg:{
							color:function(){
								// lets make some examples
								// add a mouse
								return 'red'
							}
						}
					})
				)
			)
		)
	]}
	
	
	
})