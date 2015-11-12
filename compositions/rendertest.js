//Pure JS based composition
define.class(function(composition, require, screens, button, server, screen, view, text){
	var nodehttp = require('$server/nodehttp')
	this.render = function(){ return [
		server({
			init:function(){
				console.log("IM IN NODEJS")
			},
			test:function(arg){
				return "HELLO" 
				//return nodehttp("http://www.google.com?"+arg)
			}
		}),
		screens(
			screen({name:'mobile'},
				view({
					render:function(){
						var res = []
						for(var key in this.data){
							res.push(
								button({text:this.data[key],click:function(){console.log("CLICK")}})
							)
						}
						return res
					},
					attribute_data:{type:Object},
					data:[],
					i:0,
					bg:{
						kali2d: function(pos, steps, space){
							var v = pos
							for(var i = 0; i < 130; i ++){
								if(i > int(steps)) break
								v = abs(v)
								v = v / (v.x * v.x + v.y * v.y) + space
							}			
							return v
						},
						color: function(){
							return pal.pal1( kali2d(uv.xy, 12, vec2(-0.8280193310201044, -0.658019331020104 - abs(0.1 * cos(time)))).y )
						}
					},
					mouseleftdown:function(){
						this.data.push(this.i++)
						this.data = this.data 
						console.log("DOWN")
					},
					w:2000, h:1000
				})
			),
			screen({name:'desktop', flexdirection:'row'},
				view({
					init:function(){
						console.log("IN BROWSER")
						this.rpc.server.test("q=test").then(function(result){
							console.log(result.value)
						})
					},
					flex:1,
					bg:{
						color:function(){
							return pal.pal1(noise.snoise3(uv.x*15,uv.y*15,time))
						}
					}
				})
			)
		)
	]}
})