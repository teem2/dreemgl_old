define.class(function(composition, require, screens, screen, docviewer, button, text, scrollcontainer, codeviewer, view, slideviewer, draggable, perspective3d, teapot,ballrotate, architecture){
	// Live coding presentation docs!

	this.attributes = {HELLO: {type:vec4,value:'red'}};
	
	this.render = function render(){ 
		return [
			screens(
				screen({name:'desktop',
					init:function(){
						this.rpc.screens.remote.pager = function(value){
							this.children[0].page += value
						}.bind(this)
					}},
					slideviewer({
						init:function(){
							console.log()
						},
						slideheight:800,
						position:'absolute',
						x: 0,
						bgcolor:'black'
					}
					,view({
							bgcolor:"transparent", 
							flex:1,
							slidetitle:'DreemGL test'
						}
						,perspective3d({bgcolor:"transparent", name:"teapotview", flex:1,flexdirection:"row", clipping:true,camera:[10,-10,-30],fov:60,flex:1}
							,teapot({pos:[0,-100],bg:{diffusecolor:'white'},rot3d:[PI/2,0,0], pos3d:[0,2,0]})
							,ballrotate({bgcolor:"transparent", init:function(){this.target= this.find("teapotview");}, flex:1})	
						)
					)
					,view({
						slidetitle:'This thing'
						,flex:1
						}
						,scrollcontainer({flex:1},
							codeviewer({flex:1,margin:vec4(10),code:render.toString(), padding:vec4(4), fontsize: 14, bgcolor:"#000030", multiline: true})
						)
					)
					,view({
							slidetitle:'High level overview'
							,flex:1 , bgcolor:"transparent" 
						}
						,view({left:100, top:100,width:800, height:450, bgimage:require('./graph.png'),
							bg:{
								bgcolorfn:function(pos,dist){
									return texture.sample(pos)
									//return texture.sample(pos+0.1*noise.noise3d(vec3(pos, time)))
								}
							}})
					)
					/*,view({
							slidetitle:'Architecture overview'
							,flex:1 , bgcolor:"transparent" 
						}
						,architecture({flex:1, file:require("./dreemglarchitecture.json")})
					)*/
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
			)
		),
		screen({
				attribute_pager:{type:int, value:0},
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