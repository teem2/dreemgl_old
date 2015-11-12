define(function(require){
	return function(img){
		var canvas = document.createElement("canvas")
		canvas.width = img.width
		canvas.height = img.height
		var ctx = canvas.getContext('2d')
		ctx.drawImage(img, 0, 0)
		var data = ctx.getImageData(0,0,canvas.width, canvas.height)
		return data
	}
})