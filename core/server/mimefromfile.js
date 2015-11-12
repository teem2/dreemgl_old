// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Basic set of mime types

define(function(){
	var mimeTypes = {
		htm: "text/html",
		html: "text/html",
		js: "application/javascript",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		txt: "text/plain",
		css: "text/css",
		ico:  "image/x-icon",
		png: "image/png",
		gif: "image/gif"
	}

	var regex = RegExp("\\.(" + Object.keys(mimeTypes).join("|") + ")$")

	function mimeFromFile(name){
		var ext = name.match(regex)
		return ext && mimeTypes[ ext[1] ] || "text/plain"
	}

	mimeFromFile.__trace__ = 3

	return mimeFromFile
})
