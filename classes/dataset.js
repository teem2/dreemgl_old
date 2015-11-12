// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(require, node){	
	// The dataset class allows you to share a single "document" between various parts of your application. 
	// The dataset provides undo/redo functionality by serializing its contents to a JSON string.
	// To modify a dataset you need to use the "fork" method. The fork method saves the current instance to the undo stack, calls back to your code and then notifies all objects that have this dataset instance bound to them to update themselves.

	// Basic dataset modification example:	
	define.example(this, function Usage(dataset){
		var a = dataset();
		someitem.dataset = a;
		a.fork(function(data){data.something = "a value"; })
		return text({text:a.data.something});
	});

	this.atConstructor = function(){
		this.undo_stack = []
		this.redo_stack = []
		this.connected_objects = []
		this.data = this.constructor_props
	}

	// Handles the binding of this dataset to the attribute of something else.
	this.atAttributeAssign = function(obj, key){
		for(var i = 0; i < this.connected_objects.length; i++){
			var co = this.connected_objects[i];
			if (co.obj === obj) return;
		}
		this.connected_objects.push({obj:obj, key:key})
	}

	// Fork starts a new modification on a dataset;
	// <callback> the function that will be called with a modifyable javascript object. DO NOT under any circumstances directly modify this data property!
	this.fork = function(callback){
		this.undo_stack.push(JSON.stringify(this.data))
		this.redo_stack.length = 0
		callback(this.data)
		this.notifyAssignedAttributes();
	}

	// Silent operates much the same as <fork>, but does not notify listeners bound to this dataset. This can be used in case you are CERTAIN that this object is the only object in your application that listens to your changed property, but you still need to save the state to the undo stack
	// <callback> the function that will be called with a modifyable javascript object. DO NOT under any circumstances directly modify this data property!	
	this.silent = function(callback /*function*/){
		this.undo_stack.push(JSON.stringify(this.data))
		this.redo_stack.length = 0
		callback(this.data)		
		if (this.atChange) this.atChange();
	}

	// Cause objects that have us assigned to reload
	this.notifyAssignedAttributes = function(){
		for(var i = 0; i < this.connected_objects.length; i++){
			var o = this.connected_objects[i]
			o.obj[o.key] = this
		}
		
		if (this.atChange) this.atChange();
	}
	
	// Convert all javascript binary arrays in to their correct objects.
	// <node> the node to clean up.
	
	
	// convert a string in to a meaningful javascript object for this dataset. The default is JSON, but you could use this function to accept any format of choice. 
	this.JSONParse = function(stringdata){
		var data = JSON.parse(stringdata)
		data = define.structFromJSON(data);
		return data;
	}
	
	// convert an object in to a string. Defaults to standard JSON, but you could overload this function to provide a more efficient fileformat. Do not forget to convert the JSONParse function as well.
	this.JSONStringify = function(data /*Object*/) /*String*/ {
		return JSON.stringify(data);
	}
	
	// Go back to the previous state. All classes that have this dataset bound will get their assignment updated
	this.undo = function(){
		if(!this.undo_stack.length) return
		this.redo_stack.push( this.JSONStringify(this.data))
		this.data = this.JSONParse(this.undo_stack.pop());
		this.notifyAssignedAttributes();
	}

	// Go back to the previous state. All classes that have this dataset bound will get their assignment updated
	this.redo = function(){
		if(!this.redo_stack.length) return
		this.undo_stack.push(JSON.stringify(this.data))
		this.data = this.JSONParse(this.redo_stack.pop())
		this.notifyAssignedAttributes();
	}
	
	
	
	
})