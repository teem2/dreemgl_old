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

								return vec4(0,1,0,1)
								// gradient
								//return mix('red','blue', mesh.y)

								// plasma
								//return pal.pal1(noise.noise3d(vec3(mesh.x,mesh.y,view.time)))

								// something crazy
								//return demo.highdefblirpy(mesh.xy, view.time, 1.)

								// fractal
								//return pal.pal1(demo.kali2d(mesh.xy, 10, vec2(-0.65,-0.5+0.1*sin(view.time))).x)

								// circles
								// we have a rectangle
								/*
								var t = view.time
								var field = float(0)
								var p = mesh.xy * vec2(view.layout.width, view.layout.height) + vec2(-500,-300)

								var scale = 100
								field = shape.circle(p, 0, 0, 50)
								field = shape.smoothpoly(shape.circle(p, scale*sin(t), scale*cos(t), 50), field, 70.)
								field = shape.smoothpoly(shape.circle(p, scale*sin(2*t), scale*cos(4*t), 50), field, 70.)
								field = shape.smoothpoly(shape.circle(p, scale*sin(3*t), scale*cos(5*t), 50), field, 70.)

								var edge = 1.
								//return pal.pal1(field*0.01)
								var fg = vec4('white'.rgb, smoothstep(edge, -edge, field))
								var bg = vec4(0.,0.,0.,0.05)
								return mix(bg.rgba, fg.rgba, fg.a)
								*/
							}
						}
					})
				)
			)
		)
	]}
})