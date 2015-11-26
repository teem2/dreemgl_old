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
								
								var col1 = vec3(0.1,0.1,0.1);
								var col2= vec3(0.2,0.25,0.5);
								return vec4(mix(col1, col2, 1-uv.y  + noise.noise2d(uv.xy*403.6)*0.1),1.0)
							}
						}},
						view({flexdirection:"row", bgcolor:"transparent",padding:7 },
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
									cp.basehue = Math.random();
									console.log(cp.color);
								}
							})
						),
						colorpicker({})
					)
								

				)
			)
		)
	]}
	
})