define.class(function( composition, screens, geomtest, screen){
	
	this.render = function(){
		return [
			screens(
				geomtest()
			)
		]
	}
})
