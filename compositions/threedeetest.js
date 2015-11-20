//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button, cube, splitcontainer, button, sphere, plane){

	var mousedebug = define.class(function mousedebug(view){
		
		this.attributes = {
			buttoncolor1: {type: vec4, value: vec4("#9090b0")},
			buttoncolor2: {type: vec4, value: vec4("#8080c0")}
		}

		this.bg  = {
			mousepos: vec2(0), 
			gridcolor: vec4("#ffffff"),
			grid:function(a){
				if (floor(mod(a.x ,50. )) == 0. ||floor(mod(a.y ,50. )) == 0.)	{
					return mix(gridcolor, vec4(0.9,0.9,1.0,1.0), 0.5)
				}
				if (floor(mod(a.x ,10. )) == 0. ||floor(mod(a.y ,10. )) == 0.)	{
					return mix(gridcolor, vec4(0.9,0.9,1.0,1.0), 0.2)
				}
				return gridcolor
			},
			bordercolor: vec4("#c0c0c0"),
			borderwidth: 1,
			cornerradius: 14,
			color: function(){
				var dx = abs(pos.x - mousepos.x)
				var dy = abs(pos.y - mousepos.y)
				var mindist = min(dx, dy)
				var a = pos.xy
				return mix(grid(a), mix(vec4(1,1,0.8,1),vec4(0,0,0,1),clamp((1.-mindist)*1.0, 0.,1. )),clamp((1.-mindist/5.0)*1.0, 0.,1. )/2.)
			}
		}
		
		this.render = function(){
			return [view({bgcolor: "red", fgcolor: "darkgray", text:"this is a small text that will contain the cursor after move", position:"absolute" ,width: 10})]
		}
		
		this.mousemove = function(a){
			console.log("mousecoord coming in:", a);
			this.bgshader.mousepos = vec2(a[0],a[1])
			this.redraw()
			//this.screen.addDirtyNode(this);
			
			if (this.children.length > 0){
				this.children[0].text = Math.round(a[0]) + ", " + Math.round(a[1]);
				this.children[0].pos = vec2(a[0],a[1])
			}
		}
	})
	
	
	
	this.render = function(){ return [
		screens(
			screen({clearcolor:'#484230', flexdirection:'row'}
				,splitcontainer({ vertical: false, flexdirection: "row", bgcolor: "black", flex:1}
					,view({
							flex:1,
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
							console.log("meh?");
							var cam = this.find("theview");
							cam.camera = vec3(0,0,4);
							cam.fov = 30;
							}
						})
						,button({text:"Far", click:function(){
							console.log("meh?");
							var cam = this.find("theview");
							cam.camera = vec3(4,0.2,5);
							cam.fov = 90;
							}
							
						})
						,mousedebug({width:100, height:100})
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
						,plane({translate:vec3(0,-2,0), dimension:vec3(500), rotate:vec3(PI/2,0,0)})
						,sphere({translate:vec3(0,0,2), radius:0.5})
						,view({mode:'2D', bgcolor:"red", pixelratio:10, scale: vec3(0.01, -0.01, 0.01), rotate:vec3(0,PI, 0)}
							,button({text:"Near2", click:function(){
								console.log("meh?");
								var cam = this.find("theview");
								cam.camera = vec3(0,0,-2);
								cam.fov = 30;
								}
							})
							,button({text:"Live", click:function(){
								console.log("meh?");
								var cam = this.find("theview");
								cam.camera = vec3(4,0.2,-10);
								cam.fov = 90;
								}
								
							})		
							,mousedebug({width:100, height:100})

												)
						
					)
				)
			)
		)
	]}
	
})