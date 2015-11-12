// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class('./view_gl', function (require, exports, self) {
		
	var ScreenGL = require('./screen_gl')

	this.init = function(){
		this.guidmap = {};
		this.guidmap[0] = this;
	}

	this.renderDiff = ScreenGL.prototype.renderDiff

	this.setFocus = function(){
	}
	
	this.debugtext = function(){
	}
	
	this.addDirtyNode = function(node){
	}
	
	this.allocGuid = function(node){
		return 1;
	}
	
	this.freeGuid = function(node){
		return;
	}

	this.addDirtyRect = function(node){
	}
	
	this.requestLayout = function(){
		//this.screen.requestLayout();
//		this.reLayout();
	}	
	
	this.atLoad = function(){
		console.log("atload" );
		
	//	this.reLayout();
	}
	this.atRender = function(){
//		this.reLayout();
	}
	
})
