define.class(function( composition, screens, geomtest){
	
	this.render = function(){
		return [
			screens(
				geomtest()
			)
		]
	}
})
