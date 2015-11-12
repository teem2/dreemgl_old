// Copyright 2015 this2 LLC, MIT License (see LICENSE)
// this class

define.class('$base/composition_base', function(require, baseclass){

	var Node = require('$base/node')
	var RpcProxy = require('$rpc/rpcproxy')
	var RpcHub = require('$rpc/rpchub')

	var WebRTC = require('$rpc/webrtc')
	var BusClient = require('$rpc/busclient')
	var Render = require('$base/render')

	this.atConstructor = function(previous, parent){
		this.parent = parent

		// how come this one doesnt get patched up?
		baseclass.prototype.atConstructor.call(this)

		this.screenname = location.search && location.search.slice(1)

		// web environment
		if(previous){
			this.bus = previous.bus
			this.rpc = previous.rpc
			this.rpc.host = this
			this.rendered = true
		}
		else this.createBus()

		this.renderComposition()

		this.screen = this.names.screens[this.screenname]
		if(!this.screen){
			this.screen = this.names.screens.constructor_children[0]			
			this.screenname = this.screen.name || this.screen.constructor.name
		}

		if(previous || parent) this.doRender(previous, parent)
	}

	this.doRender = function(previous, parent){
		
		var globals = {
			composition:this,
			rpc:this.rpc,
			screen:this.screen,
			device:this.device
		}
		globals.globals = globals
		window.comp = this

		// copy keyboard and mouse objects from previous

		if(parent){
			this.screen.device = parent.screen.device
			this.screen.parent = parent
		}
		//this.screen.teem = this
		Render.process(this.screen, previous && previous.screen, globals)
		
		if(this.screen.title !== undefined) document.title = this.screen.title 
				
		if(previous){
			this.screen.setDirty(true)
		}

		this.rendered = true
	}

	this.callRpcMethod = function(msg){
		var prom = this.rpc.allocPromise()
		msg.uid  = prom.uid
		this.bus.send(msg)
		return prom
	}

	this.setRpcAttribute = function(msg){
		this.bus.send(msg)
	}

	this.createBus = function(){
		
		this.bus = new BusClient(location.pathname)

		// create the rpc object
		this.rpc = new RpcHub(this)

		this.bus.atMessage = function(msg, socket){
			if(msg.type == 'sessionCheck'){
				if(this.session) location.href = location.href
				if(this.session != msg.session){
					this.bus.send({type:'connectScreen', name:this.screenname})
				}
			}  
			/*
			else if(msg.type == 'webrtcOffer'){
				if(msg.index != this.index && this.webrtc_offer){ // we got a webrtcOffer
					this.webrtc_answer = WebRTC.acceptOffer(msg.offer)
					this.webrtc_answer.onIceCandidate = function(candidate){
						//console.log('sending answer candidate')
						this.bus.send({type:'webrtcAnswerCandidate', candidate:candidate, index: this.index})
					}
					this.webrtc_answer.onAnswer = function(answer){
						//console.log('sending answer')
						this.bus.send({type:'webrtcAnswer', answer:answer, index: this.index})
					}
					this.webrtc_answer.atMessage = this.webrtc_offer.atMessage
				}
			}
			else if(msg.type == 'webrtcAnswer'){
				if(this.webrtc_offer && msg.index != this.index){
					//console.log('accepting answer')
					this.webrtc_offer.acceptAnswer(msg.answer)
				}
			}
			else if(msg.type == 'webrtcAnswerCandidate'){
				if(this.webrtc_offer && msg.index != this.index){
					//console.log('adding answer candidate')
					this.webrtc_offer.addCandidate(msg.candidate)
				}
			}
			else if(msg.type == 'webrtcOfferCandidate'){
				if(this.webrtc_answer && msg.index != this.index){
					//console.log('adding offer candidate')
					this.webrtc_answer.addCandidate(msg.candidate)
				}
			}*/
			else if(msg.type == 'connectScreenOK'){
				//RpcProxy.createFromDefs(msg.rpcdef, this, rpcpromise)
				/*
				this.webrtc_offer = WebRTC.createOffer()
				this.index = msg.index

				this.webrtc_offer.atIceCandidate = function(candidate){
					this.bus.send({type:'webrtcCandidate', candidate:candidate, index: this.index})
				}.bind(this)

				this.webrtc_offer.atOffer = function(offer){
					this.bus.send({type:'webrtcOffer', offer:offer, index: this.index})
				}.bind(this)
				*/
				for(var key in msg.attributes){
					var attrmsg = msg.attributes[key]
					// process it
					this.bus.atMessage(attrmsg, socket)
				}

				if(!this.rendered) this.doRender()
			}
			else if(msg.type == 'connectScreen'){
				//var obj = RpcProxy.decodeRpcID(this, msg.rpcid)
				//if(!obj) console.log('Cannot find '+msg.rpcid+' on join')
				//else obj.createIndex(msg.index, msg.rpcid, rpcpromise)
			}
			else if(msg.type == 'attribute'){

				var split = msg.rpcid.split('.')
				var obj
				// see if its a set attribute on ourself
				if(split[0] === 'screens' && split[1] === this.screenname){
					obj = this.screen
				}
				else{
					obj = this.rpc
					for(var i = 0; i < split.length; i++){
						obj = obj[split[i]]
						if(!obj) return console.log("Invalid rpc attribute "+ msg.rpcid)
					}
				}

				var value =  define.structFromJSON(msg.value)

				var attrset = obj.atAttributeSet
				obj.atAttributeSet = undefined
				obj[msg.attribute] = value
				obj.atAttributeSet = attrset
			}
			else if(msg.type == 'method'){
				// someone is calling a method on us. 
				method = this.screen[msg.method]
				if(!method){
					return console.log("Invalid rpc method" + msg.method)
				}
				var ret = method.apply(this.screen, msg.args)
				var uid = msg.uid
				if(ret && typeof ret === 'object' && ret.then){ // promise
					ret.then(function(result){
						var rmsg = {type:'return', uid:uid, value:result}
						if(!define.isSafeJSON(result)){
							console.log("Rpc return value not json safe" + msg.method)
							rmsg.error = 'Return value not json safe'
							rmsg.value = undefined
						}
						socket.send(rmsg)
					})
				}
				else{
					var rmsg = {type:'return', uid:uid, value:ret}
					if(!define.isSafeJSON(ret)){
						console.log("Rpc return value not json safe" + msg.method)
						rmsg.error = 'Return value not json safe'
						rmsg.value = undefined
					}
					socket.send(rmsg)
				}
			}
			else if (msg.type == 'return'){
				this.rpc.resolveReturn(msg)
			}
		}.bind(this)
	}

	this.log = function(){
		var args = Array.prototype.slice.apply(arguments)
		RpcProxy.isJsonSafe(args)
		this.bus.send({
			type:'log',
			args:args
		})
		console.log.apply(console, args)
	}

})