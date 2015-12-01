//Pure JS based composition
define.class(function(composition, screens, screen, view, label, slideviewer, button, cube, splitcontainer){
	this.render = function(){ return [
		screens(
			screen({
					alignitems:'center'
				},
				view({minwidth:100, height:200, justifycontent:'center',alignitems:'stretch', flexdirection:'row',bgcolor:'blue'},
					view({width:100,alignself:'stretch',bgcolor:'red'}),
					view({width:100,alignself:'stretch',bgcolor:'orange'})
				)
			)
		)
	]}
})