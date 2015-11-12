//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button){

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
//			console.log(a);
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
			screen({clearcolor:'#484230'},
				view({// size:[100,100],
					name:'viewbg',
					flexdirection:'column',
					margin:4,
					flex:1,
					borderradius:30,
					bgcolor:'#CBD6D9'
					}
					,button({text:'I BUTTON!', flex:1})
					,view({flex:1, margin:20, bgcolor:'#8FA4A6', name:'view1', borderwidth:4, bordercolor:"#F2E5C9", borderradius:12})
					,mousedebug({flex:1, margin:20})
					,view({
						flex:1, borderradius:vec4(10,20,30,40), name:'view2',
						margin:20,
						mode:'',
						blend:{
							color:function(){
								//return texture.sample(mesh.xy+0.1*sin(8*mesh.x))
								//return 'red'
							}
						},
						bgcolor:'#A39565', bordercolor:"#484230", borderwidth: 20
					})
				)
			)
		)
	]}
	
	
	
})