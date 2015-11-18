//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button, cube, splitcontainer, button){

	
	this.render = function(){ return [
		screens(
			screen({clearcolor:'#484230', flexdirection:'row'}
				,splitcontainer({ vertical: false, flexdirection: "row", bgcolor: "black", flex:1}
					,view({
							flex:1,
							mode:'2D',
							flexdirection:"column",
							bgcolor:'red',
							bg:{
								color:function(){
									return vec4(0.4, 0.4, 0.4+ mesh.y*0.8,1.0)
								}
							}
						}
						,button({text:"Button 1", click:function(){
								this.find("theview").camera = vec3(2,2,2);
							}
						})
						,button({text:"Button 2", click:function(){
								this.find("theview").camera = vec3(4,0,-20);
							}
							
						})
					)
					,view({
						flex:4,
						name:'theview', 
						bgcolor:'blue',
						clearcolor: 'green',
						mode: '3D', 
						attributes:{camera:{motion:'linear', duration:1}}
						}
						,cube({translate:vec3(0,1,0), dimension:vec3(0.5)})
						,cube({translate:vec3(1,0,0), dimension:vec3(0.5)})
						,cube({translate:vec3(0,0,0), dimension:vec3(0.5)})
						,cube({translate:vec3(0,0,1), dimension:vec3(0.5)})
					)
				)
			)
		)
	]}
	
})