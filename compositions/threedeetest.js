//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button, cube, splitcontainer, button, sphere, plane){

	
	this.render = function(){ return [
		screens(
			screen({clearcolor:'#484230', flexdirection:'row'}
				,splitcontainer({ vertical: false, flexdirection: "row", bgcolor: "black", flex:1}
					,view({
							flex:1,
							mode:'2D',
							flexdirection:"column",
							alignitems:'stretch',
							bgcolor:'red',
							bg:{
								color:function(){
									return vec4(0.4, 0.4, 0.4+ mesh.y*0.8,1.0)
								}
							}
						}
						,button({text:"Near", click:function(){
							var cam = this.find("theview");
							cam.camera = vec3(2,2,2);
							cam.fov = 30;
							}
						})
						,button({text:"Far", click:function(){
							var cam = this.find("theview");
							cam.camera = vec3(4,0.2,-10);
							cam.fov = 90;
							}
							
						})
					)
					,view({
						flex:4,
						name:'theview', 
						bgcolor:'blue',
						clearcolor: '#d0efff',
						mode: '3D', 
						camera: vec3(2,2,2),
						fov: 90,
						attributes:{
								camera:{motion:'linear', duration:1}
								,fov:{motion:'easein', duration:1}
								}
						}
						,cube({translate:vec3(0,1,0), dimension:vec3(0.5)})
						,cube({translate:vec3(1,0,0), dimension:vec3(0.5)})
						,cube({translate:vec3(0,0,0), dimension:vec3(0.5)})
						,cube({translate:vec3(0,0,1), dimension:vec3(0.5)})
						,plane({translate:vec3(0,0,2), dimension:vec3(500), rotate:vec3(PI/2,0,0)})
						,sphere({translate:vec3(0,0,2), radius:0.5})
					)
				)
			)
		)
	]}
	
})