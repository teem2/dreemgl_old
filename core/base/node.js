/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(require, constructor){
	// Node class provides events and constructor semantics

	var Node = constructor

	var OneJSParser =  require('$parse/onejsparser')
	var WiredWalker = require('$parse/wiredwalker')
	var RpcProxy = require('$rpc/rpcproxy')

	// parser and walker for wired attributes
	var onejsparser = new OneJSParser()
	onejsparser.parser_cache = {}
	var wiredwalker = new WiredWalker()
	
	this.rpcproxy = false

	this._atConstructor = function(){
		// store the args for future reference
		var args = this.constructor_args = Array.prototype.slice.call(arguments)
		this.constructor_children = []
		this.initFromConstructorArgs(args)
	}

	this.initFromConstructorArgs = function(args){
		var off = 0
		for(var i = 0; i < args.length; i++){
			var arg = args[i]
			if(typeof arg === 'object' && Object.getPrototypeOf(arg) === Object.prototype){
				this.initFromConstructorProps(arg)
				continue
			}
			if(typeof arg === 'function'){
				var prop = {}; prop[arg.name] = arg
				this.initFromConstructorProps(prop)
				continue
			}
			if(typeof arg === 'string' && i === 0){
				off = 1
				this.name = arg
				continue
			}
			if(typeof arg === 'number'){
				var o = i - off
				if(o === 0) this.x = arg
				else if(o === 1) this.y = arg
				else if(o === 2) this.w = arg
				else if(o === 3) this.h = arg
				continue
			}
			if(arg && arg.struct){
				var o = i - off
				if(o === 0) this.pos = arg
				if(o === 1) this.size = arg
				else this.bgcolor = arg
				continue
			}

			if(Array.isArray(arg)){
				this.initFromConstructorArgs(arg)
			}
			else if(arg !== undefined && typeof arg === 'object'){
				this.constructor_children.push(arg)
				var name = arg.name || arg.constructor && arg.constructor.name
				if(name !== undefined && !(name in this)) this[name] = arg
			}
		}		
	}

	this.initFromConstructorProps = function(obj){

		for(var key in obj){
			var prop = obj[key]
			var tgt = this
			var type = 0
		
			if(!this.constructor_props) this.constructor_props = {}
			this.constructor_props[key] = prop

			var idx = key.indexOf('.')
			if(idx !== -1){
				tgt = this[key.slice(0,idx)]
				key = key.slice(idx + 1)
			}

			tgt[key] = prop
		}
	}

	// render this node
	this.render = function(){
		return this.constructor_children
	}

	// Mixes in another class
	this.mixin = function(){
		for(var i = 0; i < arguments.length; i++){
			var obj = arguments[i]
			if(typeof obj == 'function') obj = obj.prototype
			for(var key in obj){
				// copy over getters and setters
				if(obj.__lookupGetter__(key) || obj.__lookupSetter__(key)){
					// ignore it
				}
				else{
					// other
					this[key] = obj[key]
				}
			}
		}	
	}

	// find node by name
	this.findChild = function(name, ignore){
		// ok so first we go down all children
		if(this === ignore) return
		if(this.name === name || this.name === undefined && this.constructor.name === name){
			return this
		}
		if(this.children) for(var i = 0; i < this.children.length; i ++){
			var child = this.children[i]
			if(child === ignore) continue
			var ret = child.findChild(name)
			if(ret !== undefined) return ret
		}
	}

	this.find = function(name, ignore){
		var ret = this.findChild(name)
		var node = this
		while(ret === undefined && node.parent){
			ret = node.parent.findChild(name, node)
			node = node.parent
		}
		return ret
	}

	// finds overload of property me on key
	this.overloads = function(key, me){
		var proto = this
		var next
		while(proto){
			if(proto.hasOwnProperty(key)){
				var val = proto[key]
				if(next && val !== me) return val
				if(val === me) next = 1
			}
			proto = Object.getPrototypeOf(proto)
		}
	}

	// calls super (not super efficient)
	this.super = function(args){
		if(arguments.length == 0 || !args) throw new Error('Please pass the arguments object as first argument into call to super')
		// fetch the function
		var me = args.callee || args
		var fnargs = args
		// someone passed in replacement arguments
		if( arguments.length > 1 ) fnargs = Array.prototype.slice.call( arguments, 1 )
		// look up function name
		var name = me.__supername__
		if( name !== undefined ){ // we can find our overload directly
			var fn = this.overloads(name, me)
			if(fn && typeof fn == 'function') return fn.apply(this, fnargs)
		} 
		else { // we have to find our overload in the entire keyspace
			for(var key in this) if(!this.__lookupGetter__(key)){
				fn = this.overloads(key, me)
				if(fn && typeof fn == 'function') {
					me.__supername__ = key // store it for next time
					return fn.apply( this, fnargs )
				}
			}
		}
	}
	
	// hide a property
	this.hideProperty = function(){
		for(var i = 0; i<arguments.length; i++){
			var arg = arguments[i]
			if(Array.isArray(arg)){
				for(var j = 0; j<arg.length; j++){
					Object.defineProperty(this, arg[j],{enumerable:false, configurable:true, writeable:true})
				}
			}
			else{
				Object.defineProperty(this, arg,{enumerable:false, configurable:true, writeable:true})
			}
		}
	}

	// check if property is an attribute
	this.isAttribute = function(key){
		var setter = this.__lookupSetter__(key)
		if(setter !== undefined && setter.isAttribute) return true
		else return false
	}

	this.getAttributeConfig = function(key){
		return this['_cfg_' + key]
	}

	this.has_wires = function(key){
		var wiredfn_key = '_wiredfn_' + key
		return wiredfn_key in this
	}
	
	this.wiredCall = function(key){
		var wiredcl_key = '_wiredcl_' + key
		return this[wiredcl_key]
	}

	// define an event
	this.event = function(key){
		this.attribute = {name:key, type:Object}
	}

	this.parse = function(key, value){

	}
	
	this.emitRecursive = function(key, value, block){

		if(block && block.indexOf(child)!== -1) return
		this.emit(key,value);
		for(var a in this.children){
			var child = this.children[a]
			child.emitRecursive(key, value)
		}
	}
	
	this.emit = function(key, value, recur){
		var on_key = 'on' + key
		var listen_key = '_listen_' + key
		var config = this['_cfg_' + key]
		var value_key = '_' + key
		if(!config){
			console.log(this)
			throw new Error("Cannot emit "+key+" attribute not found")
		}
		if(value !== undefined){ // lets check storage
			if(config.storage && !recur){
				var storage_key = '_' + config.storage
				var store
				if(!this.hasOwnProperty(storage_key)){
					store = this[storage_key]
					store = this[storage_key] = store.struct(store)
				}
				else{
					store = this[storage_key]
				}
				this[value_key] = store[config.index] = value
				//this.emit(config.storage, store)
			}
			this[value_key] = value
		}

		var proto = this
		var stack

		while(on_key in proto){
			if(proto.hasOwnProperty(on_key)) (stack || (stack = [])).push(proto[on_key])
			proto = Object.getPrototypeOf(proto)
		}

		if(stack !== undefined) for(var j = stack.length - 1; j >=0; j--){
			stack[j].call(this, value)
		}

		var proto = this
		while(listen_key in proto){
			if(proto.hasOwnProperty(listen_key)){
				var listeners = proto[listen_key]
				for(var j = 0; j < listeners.length; j++){
					listeners[j].call(this, value)
				}
			}
			proto = Object.getPrototypeOf(proto)
		}
	}

	this.addListener = function(key, cb){
		var listen_key = '_listen_' + key
		var array 
		if(!this.hasOwnProperty(listen_key)) array = this[listen_key] = []
		else array = this[listen_key]
		if(array.indexOf(cb) === -1){
			array.push(cb)
		}
	}

	this.removeListener = function(key, cb){
		var listen_key = '_listen_' + key
		if(!this.hasOwnProperty(listen_key)) return
		var cbs = this[listen_key]
		if(cbs){
			if(cb){
				var idx = cbs.indexOf(cb)
				if(idx !== -1) cbs.splice(idx,1)
			}
			else{
				cbs.length = 0
			}
		}
	}

	this.hasListenerName = function(key, fnname){
		var listen_key = '_listen_' + key
		var listeners = this[listen_key]
		if(!listeners) return false
		for(var i = 0; i < listeners.length; i++){
			if(listeners[i].name === fnname) return true
		}
		return false
	}

	this.hasListeners = function(key){
		var listen_key = '_listen_' + key
		var on_key = 'on' + key
		if(on_key in this || listen_key in this && this[listen_key].length) return true
		return false
	}

	this.removeAllListeners = function(){
		var keys = Object.keys(this)
		for(var i = 0; i < keys.length; i++){
			var key = keys[i]
			if(key.indexOf('_listen_') === 0){
				this[key] = undefined
			}
		}
	}

	this.setAttribute = function(key, value){
		this[key] = value
	}

	this.setWiredAttribute = function(key, value){
		if(!this.hasOwnProperty('_wiredfns')) this._wiredfns = this._wiredfns?Object.create(this._wiredfns):{}
		this._wiredfns[key] = value
		this['_wiredfn_'+key] = value
	}

	this.parseWiredString = function(string){
		if(string.charAt(0) !== '$' || string.charAt(1) !== '{' || string.charAt(string.length - 1) !== '}'){
			return string
		}
		src = "return " + string.slice(2,-1)
		var fn = new Function(src)
		fn.is_wired = true
		return fn
	}

	// JSON API

	Object.defineProperty(this, 'attributes', {
		get:function(){
			throw new Error("attribute can only be assigned to")
		},
		set:function(arg){
			for(var key in arg){
				this.defineAttribute(key, arg[key])
			}
		}
	})

	Object.defineProperty(this, 'events', {
		get:function(){
			throw new Error("event can only be assigned to")
		},
		set:function(arg){
			if(Array.isArray(arg)){
				for(var i = 0; i < arg.length; i++){
					this.defineAttribute(arg[i],{type:Object})
				}
			}
			else{
				if(typeof arg === 'object'){
					for(var key in arg){
						this.defineAttribute(key, {type:Object})
					}
				}
				else this.defineAttribute(arg, {type:Object})
			}
		}
	})

	this.definePersist = function(arg){
		if (!this.hasOwnProperty("_persists")){
			
			if (this._persists){
				this._persists = Object.create(this._persists)
			}
			else{
				this._persists = {}
			}
		}
		this._persists[arg] = 1
	}

	Object.defineProperty(this, 'persists', {
		get:function(){
			return this._persist
		},
		set:function(arg){
			if(Array.isArray(arg)){
				for(var i = 0; i < arg.length; i++){
					this.definePersist(arg[i])
				}
			}
			else{
				if(typeof arg === 'object'){
					for(var key in arg){
						this.definePersist(key)
					}
				}
				else this.definePersist(arg)
			}
		}
	})

	Object.defineProperty(this, 'listeners', {
		get:function(){
			throw new Error("listeners can only be assigned to")
		},
		set:function(arg){
			for(var key in arg){
				this.addEventListener(key, arg[key])
			}
		}
	})

	Object.defineProperty(this, 'setters', {
		get:function(){
			throw new Error("setter can only be assigned to")
		},
		set:function(arg){
			for(var key in arg){
				this['_set_'+key] = arg[key] 
			}
		}
	})


	Object.defineProperty(this, 'getters', {
		get:function(){
			throw new Error("getter can only be assigned to")
		},
		set:function(arg){
			for(var key in arg){
				this['_get_'+key] = arg[key] 
			}
		}
	})

	Object.defineProperty(this, 'animate', {
		get:function(){ return this.animateAttribute },
		set:function(arg){
			this.animateAttribute(arg)
		}
	})

	this.animateAttribute = function(arg){
		// count
		var arr = []
		for(var key in arg){
			var value = arg[key]
			if(typeof value === 'object'){
				var resolve, reject
				var promise = new Promise(function(res, rej){ resolve = res, reject = rej })
				promise.resolve = resolve
				promise.reject = reject
				arr.push(promise)
				this.startAnimation(key, undefined, value, promise)
			}
			else{
				if(typeof value === 'string'){
					value = value.toLowerCase()	
					if(value === 'stop'){
						this.stopAnimation(key)
					}
					else if(value === 'play'){
						this.playAnimation(key)
					}
					else if(value === 'pause'){
						this.pauseAnimation(key)
					}
				}
				resolve()
			}
		}
		if(arr.length <= 1) return arr[0]
		return Promise.all(arr)
	}

	this.defineAttribute = function(key, config){
		if(!this.hasOwnProperty('_attributes')){
			this._attributes = this._attributes?Object.create(this._attributes):{}
		}
		// lets create an attribute
		var value_key = '_' + key
		var on_key = 'on' + key
		var listen_key = '_listen_' + key
		var wiredfn_key = '_wiredfn_' + key
		var config_key = '_cfg_' + key 
		var get_key = '_get_' + key
		var set_key = '_set_' + key

		if(this.isAttribute(key)){ // extend the config
			if('type' in config) throw new Error('Cannot redefine attribute '+key)
			var obj = this[config_key] = Object.create(this[config_key])
			for(var prop in config){
				obj[prop] = config[prop]
			}
			this._attributes[key] = this[config_key]
			return
		}

		var init_value = key in this? this[key]:config.value
		if(init_value !== undefined && init_value !== null){
			if(typeof init_value === 'string' && init_value.charAt(0) === '$') init_value = this.parseWiredString(init_value)
			if(typeof init_value === 'function'){
				if(init_value.is_wired) this.setWiredAttribute(key, init_value)
				else this[on_key] = init_value
			}
			else{
				var type = config.type
				if(type && type !== Object && type !== Array){
					this[value_key] = type(init_value)
				}
				else{
					this[value_key] = init_value
				}
			}
		}
		this._attributes[key] = this[config_key] = config
		
		if(config.wired) this[wiredfn_key] = config.wired

		var setter
		var getter
		// define attribute gettersetters

		// block attribute emission on objects with an environment thats (stub it)
		if(this.environment && this.environment === define.$environment){
			setter  = function(value){
				this[set_key] = value
			}
		}
		else if(config.storage){
			var storage_key = '_' + config.storage
			
			setter = function(value){
				if(typeof value === 'string' && value.charAt(0) === '$') value = this.parseWiredString(value)
				if(this[set_key] !== undefined) value = this[set_key](value)
				if(typeof value === 'function' && (!value.prototype || Object.getPrototypeOf(value.prototype) === Object.prototype)){
					if(value.is_wired) this.setWiredAttribute(key, value)
					this[on_key] = value
					return
				}
				if(typeof value === 'object' && value !== null && value.atAttributeAssign) value.atAttributeAssign(this, key)
				if(!this.hasOwnProperty(storage_key)){
					var store = this[storage_key]
					store = this[storage_key] = store.struct(store)
				}
				else{
					store = this[storage_key]
				}
				var config = this[config_key]
				if(config.motion && this.startAnimation(key, value)){
					return
				}

				this[value_key] = store[config.index] = value

				// emitting it on storage should emit it back to myself
				this.emit(config.storage, store)

				if(this.atAttributeSet !== undefined) this.atAttributeSet(key, value)
				//if(on_key in this || listen_key in this) this.emit(key, value)
			}

			this.addListener(config.storage, function(value){
				var myval = this[value_key] = value[config.index]
				if(on_key in this || listen_key in this)  this.emit(key, myval, true)
			})
			// initialize value
			this[value_key] = this[storage_key][config.index]
		}
		else {
			setter = function(value){
				if(typeof value === 'string' && value.charAt(0) === '$') value = this.parseWiredString(value)
				if(this[set_key] !== undefined) value = this[set_key](value)
				if(typeof value === 'function' && (!value.prototype || Object.getPrototypeOf(value.prototype) === Object.prototype)){
					if(value.is_wired) this.setWiredAttribute(key, value)
					this[on_key] = value
					return
				}
				if(typeof value === 'object' && value !== null && value.atAttributeAssign) value.atAttributeAssign(this, key)
				
				var config = this[config_key]
			
				var type = config.type
				if(type){
					if(type !== Object && type !== Array) value = type(value)
				}

				if(config.motion && this.startAnimation(key, value)){
					// store the end value
					return
				}

				this[value_key] = value

				if(this.atAttributeSet !== undefined) this.atAttributeSet(key, value)
				if(on_key in this || listen_key in this)  this.emit(key, value)
			}
		}
		
		setter.isAttribute = true
		Object.defineProperty(this, key, {
			configurable:true,
			enumerable:true,
			get: function(){
				if(this.atAttributeGet !== undefined) this.atAttributeGet(key)
				var getter = this[get_key]
				if(getter !== undefined) return getter()
				// lets check if we need to map our stored type
				// if we are in motion, we should return the end value
				return this[value_key]
			},
			set: setter
		})
	}

	this.connectWiredAttribute = function(key, initarray){
		var wiredfn_key = '_wiredfn_' + key
		var wiredcl_key = '_wiredcl_' + key
		var wiredfn = this[wiredfn_key]
		var ast = onejsparser.parse(wiredfn.toString())
		var state = wiredwalker.newState()

		wiredwalker.expand(ast, null, state)

		var bindcall = function(){
			var deps = bindcall.deps
			if(deps && !bindcall.initialized){
				bindcall.initialized = true
				for(var i = 0; i < deps.length; i++) deps[i]()
			}
			this[key] = this[wiredfn_key].call(this)
		}.bind(this)

		this[wiredcl_key] = bindcall

		for(var j = 0; j < state.references.length; j++){
			var ref = state.references[j]
			var obj = {'this':this}
			for(var k = 0; k < ref.length; k++){

				var part = ref[k]
				if(k === ref.length - 1){
					// lets add a listener 
					if(!obj.isAttribute(part)){
						console.log("Attribute does not exist: "+ref.join('.')+" in wiring " + this[wiredfn_key].toString())
						continue
					}

					obj.addListener(part, bindcall)

					if(obj.has_wires(part) && !obj.wiredCall(part)){
						obj.connectWiredAttribute(part)
						if(!bindcall.deps) bindcall.deps = []
						bindcall.deps.push(obj.wiredCall(part))
					}
				}
				else{
					var newobj = obj[part]
					if(!newobj){
						if(obj === this){ // lets make an alias on this, scan the parent chain
							while(obj){
								if(part in obj){
									if(part in this) console.log("Aliasing error with "+part)
									//console.log("ALIASING" + part, this)
									obj = this[part] = obj[part]
									break
								}
								obj = obj.parent
							}
						}
					}	
					else obj = newobj
					if(!obj) console.log('Cannot find part ' + part + ' in ' + ref.join('.') + ' in propertybind', this)
				}
			}
		}
		if(initarray) initarray.push(bindcall)
	}

	this.connectWires = function(initarray, depth){

		var immediate = false
		if(!initarray) initarray = [], immediate = true

		if(this._wiredfns){
			for(key in this._wiredfns){
				this.connectWiredAttribute(key, initarray)
			}
		}
		// lets initialize bindings on all nested classes
		var nested = this.constructor.nested
		if(nested) for(var name in nested){
			var nest = this[name.toLowerCase()]
			if(nest.connectWires){
				nest.connectWires(initarray, depth)
			}
		}
		if(immediate === true){
			for(var i = 0; i < initarray.length; i++){
				initarray[i]()
			}
		}
	}

	this.disconnectWires = function(){
	}

	this.startMotion = function(key, value){
		if(!this.screen) return false 
		return this.screen.startMotion(this, key, value)
	}

	this.constructorPropsEqual = function(other){
		var str = ''
		var my_prop = this.constructor_props
		var other_prop = other.constructor_props
		if(!my_prop && other_prop) return false
		if(!other_prop && my_prop) return false
		if(!other_prop && !my_prop) return true
		for(var key in my_prop){
			var arg1 = my_prop[key]
			var arg2 = other_prop[key]

			if(typeof arg1 !== typeof arg2) return false
			
			if(typeof arg1 == 'function'){
				if(arg1.toString() !== arg2.toString()) return false
			}
			else if(typeof arg1 === 'object'){
				if(arg1.struct){
					if(arg1.length !== arg2.length) return false
					for(var i = 0; i < arg1.length; i++){
						if(arg1[i] !== arg2[i]) return false
					}
				}
				else if(arg1 !== arg2) return false
			}
			else{
				if(arg1 !== arg2) return false
			}
		}
		return true
	}

	this.createRpcProxy = function(parent){
		return RpcProxy.createFromObject(this, parent)
	}

	// support mixins
	Object.defineProperty(this, 'is', {
		set:function(value){
			// lets copy on value. 
			if(Array.isArray(value)){
				for(var i = 0; i<value.length; i++) this.is = value[i]
				return
			}
			if(typeof value === 'function') value = value.prototype
			if(typeof value === 'object'){
				for(var key in value){
					this[key] = value[key]
				}
			}
		}
	})

	this.setParent = function(value){
		if(!value) return
		if(!value.constructor_children) value.constructor_children = []
		value.constructor_children.push(this)
		this.parent = value
	}

	this.hideProperty(Object.keys(this))

	// always define an init and deinit
	this.events = ["init", "deinit"]
})