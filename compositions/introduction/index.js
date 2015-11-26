define.class(function(composition, require, screens, screen, docviewer, button, label, codeviewer, view, slideviewer, draggable, teapot, ballrotate){
	// Live coding presentation docs!
	this.attributes = {
		test:"ELLO!"
	}
	
		mousedebug = define.class(this, "mousedebug", function mousedebug(view){
		
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
		//	console.log("mousecoord coming in:", a);
			this.bgshader.mousepos = vec2(a[0],a[1])
			this.redraw()
			//this.screen.addDirtyNode(this);
			
			if (this.children.length > 0){
				this.children[0].text = Math.round(a[0]) + ", " + Math.round(a[1]);
				this.children[0].pos = vec2(a[0],a[1])
			}
		}
	})

	
	
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
						flex:1,
						mode:'2D',
						overflow:'scroll',
						slideheight:800,
						bgcolor:'black',
						attributes:{scroll:{persist:true}}
						},
						view({
							bgcolor:"transparent", 
							flex:1,
							slidetitle:'DreemGL Introductions!'
							},
							ballrotate({name:"ballrotate1", position:"absolute",width:100, height:100, target:"teapot1"})
							,view({
								flex:1,
								name:"teapot1", 
								clearcolor: 'rgba(255,255,255,0)',
								mode: '3D',
								bg:0,
								camera: vec3(0,0,8)
							},
							teapot({
								detail:10,
								pos:[0,0,-0.5], 
								rotate:[-.6*PI,PI,0], 
								radius:0.8, 
								size:vec3(0.5)
							}),
							0),
						0),
						
						view({
							slidetitle:'This thing'
							,flex:1
							,flexdirection:"column"
							},
							this.mousedebug({flex:1, width:100, height:100})
							,this.mousedebug({flex:1, width:100, height:100})
							,this.mousedebug({flex:1, width:100, height:100})
							,this.mousedebug({flex:1, width:100, height:100})
							,codeviewer({
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
									//texture: require('./graph.png'),
									color:function(){
										return 'red'
									//	return texture.sample(mesh.xy)
									}
								}})
						),
						view({
							bgcolor:"transparent", 
							flex:1,
							slidetitle:'Using shaders to style'
							},
							view({
								flex:1,
								clearcolor: 'rgba(255,255,255,0)',
								mode: '3D',
								bg:0,
								camera: vec3(0,0,18),
								render: function(){
									var ret = []
									for(var i = 0; i < 16; i ++) ret.push(
										teapot({
											detail:5,
											position:'absolute',
											attributes:{
												vanim:{type:float, value:0, duration:0.5, motion:'bounce'}
											},
											mouseover:function(){
												this.vanim = 1
											},
											mouseout:function(){
												this.vanim = 0
											},
											bg:{
												i:i,
												view:{vanim:0},
												patterns: require('./shaderpatterns').prototype,
												color:function(){
													return vec4( patterns.wave(mesh.uv, i*.1 + 
														view.vanim * 10., i*.1 + view.vanim * 10.) * 
														pal.pal1(i*.1).xyz, 1.)
												//	return vec4( patterns.stripe(mesh.uv, 10., i*.1 + view.vanim * 10.) * pal.pal1(i*0.1).xyz, 1.) 
												}
											},
											rotate:[-.6*PI,PI,0], 
											pos:[floor(i/4)*6-10,(i%4)*6-10,-10]
										})
									)
									return ret
								}
							}),
						0),
						view({
							flex:1,
							slidetitle:'Rendering vs drawing',
							},
							view({flexdirection:'row', flex:1},
								codeviewer({
									flex:1,
									alignself:'stretch',
									margin:vec4(10),
									wrap:true,
									source:function(){
										// Rendering returns scenegraph structures
										this.render = function(){
											return view({}, view({}))
										}

										// subclass the default background shader
										this.bg = {
											value:0,
											color:function(){
												return mix('blue', 'red', abs(sin(uv.y*10.+value)))
											}
										}
									}.toString(), 
									padding:vec4(4), 
									fontsize: 14, 
									bgcolor:"#000030", 
									multiline: true
								}),
								view({
									flex:1,
									padding:4,
									margin:10, 
									cornerradius:0,
									bg:{
										value:1,
										color:function(){
											return mix('blue', 'red', abs(sin(uv.y*10.+value)))
										}
									}
								}),
							0),
						0),
						view({
							flex:1,
							visible:false,
							slidetitle:'Compositions'
							}
							,codeviewer({
								mode:'2D',
								overflow:'scroll',
								flex:1,
								margin:vec4(10),
								source:require('../rpcremote').module.factory.body.toString(), 
								padding:vec4(4), 
								fontsize: 14, 
								bgcolor:"#000030",
								multiline: true
							})
						),

						view({
							flex:1,
							slidetitle:'Live documentation'
							},
							docviewer({flex:1, class:this.constructor}),
						0),
					0),
				0),
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
			)
		]
	}
})