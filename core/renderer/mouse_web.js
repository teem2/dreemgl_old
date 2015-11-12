// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Mouse class

define.class('$base/node', function (require, exports, self){
	this.event('move')
	this.attribute('x', {type:float})
	this.attribute('y', {type:float})
	this.attribute('isdown', {type:int})
	this.attribute('left', {type:int})
	this.attribute('middle', {type:int})
	this.attribute('right', {type:int})
	this.attribute('click', {type:int})
	this.attribute('blurred', {type:int})
	this.attribute('dblclick', {type:int})
	this.attribute('clicker', {type:int})
	this.attribute('leftdown', {type:int})
	this.attribute('leftup', {type:int})
	this.attribute('rightdown', {type:int})
	this.attribute('rightup', {type:int})
	this.attribute('wheelx', {type:int})
	this.attribute('wheely', {type:int})

	this.ratio = 0
	
	this.activedown = 0;
		
	this.clickspeed = 350

	this.atConstructor = function(){
		x = 0
		y = 0
		if(this.ratio == 0) this.ratio = window.devicePixelRatio

		document.ontouchmove = function(e){
			e.preventDefault()
		}
		// allright we need to figure out how we send back the mouse events to the worker
		// are we going to send a vec2? or something else
		window.addEventListener('click', function(e){
			this.click = 1
		}.bind(this))

		window.addEventListener('blur', function(e){
			this.blurred =1;
		}.bind(this))

		window.addEventListener('dblclick', function(e){
			this.dblclick = 1
		}.bind(this))

		window.addEventListener('wheel', function(e){
			if(e.deltaX !== 0) this.wheelx = e.deltaX
			if(e.deltaY !== 0) this.wheely = e.deltaY
			e.preventDefault()
		}.bind(this))

		var click_count = 0

		this.resetClicker = function(){
			click_count = 0
		}
		
		this.mousedown = function(e){
			var now = Date.now()
			if (this.activedown == 0){
				//document.body.setCapture();
			}
			this.activedown++;
			if(this.last_click !== undefined && now - this.last_click < this.clickspeed){
				click_count ++
			}
			else click_count = 1
			this.last_click = now

			this.clicker = click_count

			this.x = e.pageX// / this.ratio//* window.devicePixelRatio
			this.y = e.pageY// / this.ratio//* window.devicePixelRatio

			if(e.button === 0 ) this.cancapture = 1, this.left = 1, this.leftdown = 1
			if(e.button === 1 ) this.cancapture = 3, this.middle = 1
			if(e.button === 2 ) this.cancapture = 2, this.right = 1, this.rightdown = 1
			this.isdown = 1
			e.preventDefault()
			overlay.style.display = 'block'
		}

		window.addEventListener('mousedown', this.mousedown.bind(this))

		this.mouseup = function(e){
			this.activedown--;
			if (this.activedown == 0){
				//document.body.releaseCapture();
			}
			this.x = e.pageX// / this.ratio//* window.devicePixelRatio
			this.y = e.pageY// / this.ratio //* window.devicePixelRatio
			this.cancapture = 0
			if(e.button === 0) this.left = 0, this.leftup = 1
			if(e.button === 1) this.middle = 0
			if(e.button === 2) this.right = 0, this.rightup = 1
			this.isdown = 0
			e.preventDefault()
			overlay.style.display = 'none'
		}

		window.addEventListener('mouseup', this.mouseup.bind(this))
		
		this.mousemove = function(e){
			//last_click = undefined
			//if(layer) hit = layer.hitTest2D(e.pageX * ratio, e.pageY * ratio)
			this.x = e.pageX// / this.ratio//* window.devicePixelRatio
			this.y = e.pageY// / this.ratio//* window.devicePixelRatio
			this.move = 1
			e.preventDefault()
		}

		window.addEventListener('mousemove', this.mousemove.bind(this))

		var overlay = this.overlay
		if(!overlay){
			overlay = this.overlay = document.createElement(this.tag || 'div')
			document.body.appendChild(this.overlay)
			overlay.style.display = 'none'
			overlay.style.position = 'absolute'
			overlay.style.zIndex = 10000000
			overlay.style.width = '100%'
			overlay.style.height = '100%'

			overlay.addEventListener('mousedown', this.mousedown.bind(this.mouse))
			overlay.addEventListener('mouseup', this.mouseup.bind(this.mouse))
			overlay.addEventListener('mousemove', this.mousemove.bind(this.mouse))
		}


	}
})
