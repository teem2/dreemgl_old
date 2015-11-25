//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button, cube, splitcontainer){
	this.render = function(){ return [
		screens(
			screen({clearcolor:vec4('black')},
				view({flex:1, bgcolor:'gray', borderradius:20, flexdirection:'column', padding:30},
					label({text:'Live shader coding', bg:0, fontsize: 38, marginbottom:20, fgcolor:'black'}),
					view({
						flex:1,
						bg:{
							color:function(){
								// gradient
								//return mix('red','blue', mesh.y)

								// plasma
								//return pal.pal1(noise.noise3d(vec3(mesh.x,mesh.y,view.time)))

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