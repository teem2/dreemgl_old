//Pure JS based composition
define.class(function(composition, screens, screen, codeviewer){
	this.render = function(){ return [
		screens( 
			screen( 
					codeviewer({fontsize:80,bgcolor:'vec4(transparent)'}
				)
			)
		)
	]}
})