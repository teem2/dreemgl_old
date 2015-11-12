// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(){
	this.atConstructor = function(){}

	// Base class for all implementations of the device subsystem

	// a device should:
	// - open a drawing context for a single "screen" in the composition
	// - provide user-interface hooks (mouse/keyboard) 
	// - provide a frame-hook for accurate tear-free display & animations



	this.atRedraw = function(time){}

	this.atResize = function(){}

	// some list of layers

	// layer has list of draweable shader instances + ref to mesh
		// - calculateable z-index
		// - 3d mode needs to sort

	
});