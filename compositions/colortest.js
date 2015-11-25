//Pure JS based composition
define.class(function(composition, screens, screen, view, label, button, colorpicker, splitcontainer, button){

	
	
	
	this.render = function(){ return [
		screens(
			screen({clearcolor:'#484230', flexdirection:'row'},
				splitcontainer({ vertical: false, flexdirection: "row", bgcolor: "black", flex:1},
					view({
						flex:1,
						flexdirection:"column",
						alignitems:'stretch',
						bgcolor:'blue',
						bg:{
							color:function(){
								return vec4(0.4, 0.4, 0.4+ mesh.y*0.8,1.0)
							}
						}},
						button({
							text:"Test color using vec4 constructor", 
							click:function(){
								var cp = this.find("colorpicker");	
								cp.color = vec4("blue");
								console.log(cp.color);
								
							}
						}),
						
						button({
							text:"Set color from HSL", 
							click:function(){
								var cp = this.find("colorpicker");	
								cp.color = vec4.fromHSL(0.5,1,0.5);
								console.log(cp.color);
							}
						}),
						colorpicker({})
					)
								

				)
			)
		)
	]}
	
})