define.class(function(composition, require, screens, screen, docviewer, button, label, codeviewer, view, slideviewer, draggable, teapot){
	// Live coding presentation docs!
	
	this.render = function render(){ 
		return [
			screens(
				screen({
					name:'desktop',
					init:function(){
						this.rpc.screens.remote.pager = function(event){
							this.children[0].page += event.value
						}.bind(this)
					}},
					slideviewer({
						slide:{
							padding:15,
							borderradius:20
						},
						mode:'2D',
						overflow:'scroll',
						slideheight:800,
						bgcolor:'black',
						attributes:{scroll:{persist:true}}
						},
						view({
							bgcolor:"transparent", 
							flex:1,
							slidetitle:'DreemGL test'
							},
							view({
								flex:1,
								clearcolor: 'rgba(255,255,255,0)',
								mode: '3D',
								bg:0,
								camera: vec3(0,0,8)
							},
							teapot({
								pos:[0,0,-0.5], rotate:[-.6*PI,PI,0], radius:0.8, size:vec3(0.5)}),
							0),
						0),
						view({
							slidetitle:'This thing'
							,flex:1
							},
							codeviewer({
								mode:'2D',
								overflow:'scroll',
								flex:1,
								margin:vec4(10),
								source:render.toString(), 
								padding:vec4(4), 
								fontsize: 14,
								bgcolor:"#000030", 
								multiline: true
							}),
						0),
						view({
							slidetitle:'High level overview',
							flex:1 , bgcolor:"transparent" 
							},
							view({
								left:100, 
								top:100,
								width:800, 
								height:450, 
								bg:{
									texture: require('./graph.png'),
									color:function(){
										return texture.sample(mesh.xy)
									}
								}})
						),
					/*
					,view({
							flex:1,
							bgcolor:'transparent',
							slidetitle:'Using shaders to style'
						}
						,perspective3d({bgcolor:'transparent',name:"teapotview2", flex:1,flexdirection:"row", clipping:true,camera:[10,-10,-70],fov:60,flex:1,
							render:function(){
								var ret = [
									ballrotate({
										bgcolor:"transparent", 
										init:function(){this.target= this.find("teapotview2");}, flex:1}
									)
								]
								for(var i = 0; i < 16; i ++) ret.push(
									teapot({
										position:'absolute',
										attribute_vanim:{type:float, value:0, duration:0.5, motion:'bounce'},
										mouseover:function(){
											this.vanim = 1
										},
										mouseout:function(){
											this.vanim = 0
										},
										pos:[0,0],
										bg:{
											i:i,
											view:{vanim:0},
											patterns: require('./shaderpatterns').prototype,
											color:function(){
											//	return vec4( patterns.wave(mesh.uv, i*.1 + view.vanim * 10., i*.1 + view.vanim * 10.) * pal.pal1(i*.1).xyz, 1.)
												return vec4( patterns.stripe(mesh.uv, 10., i*.1 + view.vanim * 10.) * pal.pal1(i*0.1).xyz, 1.) 
											}
										}
										,rot3d:[PI/3,0,0], pos3d:[floor(i/4)*12-17,(i%4)*10-15,0]
									})
								)
								return ret
							}
						})
					)
					,view({
						flex:1,
						slidetitle:'Rendering vs drawing'
					},
					view({flexdirection:'row', flex:1},
						codeviewer({flex:1,alignself:'stretch',margin:vec4(10),code:function(){
							
							// Rendering returns scenegraph structures
							this.render = function(){
								return view({}, view({}))
							}

							// Drawing is the actual GL drawcall flow
							this.atDraw = function(){ // called right before drawing
								// we can mess with the shader instance here
								this.bg_shader.value += 0.1
							}

							// make sure we redraw on mousemove
							this.mousemove = function(){
								this.setDirty(true)
							}
							
							// subclass the default background shader
							this.bg = {
								value:0,
								color:function(){
									return mix('blue', 'red', abs(sin(uv.y*10.+value)))
								}
							}
						}.toString(), padding:vec4(4), fontsize: 14, bgcolor:"#000030", multiline: true})
						,view({flex:1,padding:4,margin:10, cornerradius:0,
								mousemove:function(){
									this.setDirty(true)
								},
								atDraw:function(){
									this.bg_shader.value += 0.1
								},
								bg:{
								value:1,
								color:function(){
									return mix('blue', 'red', abs(sin(uv.y*10.+value)))
								}
							}
						})
					)
				)
				,view({
						flex:1,
						clipping:true,
						slidetitle:'Compositions'
					}
					,codeviewer({flex:1,margin:vec4(10),code:require('../rpcremote').module.factory.body.toString(), padding:vec4(4), fontsize: 14, bgcolor:"#000030", multiline: true})
				)
				,view({
						flex:1,
						slidetitle:'Live documentation'
					}
					,docviewer({flex:1, model:this.constructor})
				)
				*/
			0)
		),
		screen({
				attributes:{pager:0},
				name:'remote',
			}
			,view({flex:1, bgcolor:'black'}
				,button({
					text:'Left',
					flex:1,
					size: vec2(200, 200),
					bgcolor: vec4('yellow'),
					//is: draggable(),
					click: function(){
						this.screen.pager = -1
					}
				})
				,button({
					text:'Right',
					flex:1,
					size: vec2(200, 200),
					bgcolor: vec4('red'),
					//is: draggable(),
					click: function(){
						this.screen.pager = 1
					}
				})
			)
		)
		)]
	}
})