// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Mouse class

define.class('../touch', function (require, exports, self){

	this.ratio = 0
	this.activedown = 0;
		
	this.clickspeed = 350

	this.setTouches = function(touches){
		var arr = []
		arr[0] = vec2(this.x = touches[0].pageX, this.y = touches[0].pageY)
		for(var i = 1; i < 5;i++){
			if(i >= touches.length) break;
			arr[i] = vec2(this['x'+i] = touches[1].pageX, this['y'+i] = touches[1].pageY)
		}
		return arr
	}

	this.atConstructor = function(){
		if(this.ratio == 0) this.ratio = window.devicePixelRatio

		document.ontouchmove = function(e){
			e.preventDefault()
		}.bind(this)

		window.addEventListener('touchstart', function(e){
			var arr = this.setTouches(e.touches)
			this.emit('start', arr)
		}.bind(this))

		window.addEventListener('touchend', function(e){
			this.emit('end')
		}.bind(this))

		window.addEventListener('touchcancel', function(e){
			this.emit('cancel')
		}.bind(this))

		window.addEventListener('touchleave', function(e){
			this.emit('leave')
		}.bind(this))

		window.addEventListener('touchmove', function(e){
			var arr = this.setTouches(e.touches)
			this.emit('move', arr)
		}.bind(this))
	}
})
