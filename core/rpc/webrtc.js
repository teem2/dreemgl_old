// Licensed under the Apache License, Version 2.0, see LICENSE.md
// WebRTC class

define.class(function(require, exports){
	var WebRTCData = exports
	
	WebRTCData.createOffer = function(){
		var obj = new WebRTCData()
		
		if(typeof webkitRTCPeerConnection === 'undefined') return obj

		obj.pc = new webkitRTCPeerConnection(
			{ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }]
			}, {optional: [{RtpDataChannels: true}]})

		obj.pc.onicecandidate = function(event){
			if (!event || !event.candidate) return
			this.atIceCandidate(event.candidate)
		}.bind(obj)
	
		obj.setChannel(obj.pc.createDataChannel('RTCDataChannel',{reliable:false}))

		obj.pc.createOffer(function(desc){
			this.pc.setLocalDescription(desc)
			this.atOffer(desc)
		}.bind(obj), null, obj.media_constraints)

		return obj
	}

	WebRTCData.acceptOffer = function(offer){
		var obj = new WebRTCData()

		obj.pc = new webkitRTCPeerConnection(
			{"iceServers": [{ "url": "stun:stun.l.google.com:19302" }]},
			{optional: [{RtpDataChannels: true}]})

		obj.setChannel(obj.pc.createDataChannel('RTCDataChannel', { reliable: false }))

	    obj.pc.onicecandidate = function (event) {
	        if (!event || !event.candidate) return
	       	this.atIceCandidate(event.candidate)
	    	//this.pc.addIceCandidate(event.candidate)
	    }.bind(obj)

	    obj.pc.setRemoteDescription(new RTCSessionDescription(offer))

	    obj.pc.createAnswer(function (session){
	    	this.pc.setLocalDescription(session)
	        this.atAnswer(session)
	    }.bind(obj), null, obj.media_constraints)

	    return obj
	}

	this.media_constraints = {
		optional: [],
		mandatory: {
			OfferToReceiveAudio: false, // Hmm!!
			OfferToReceiveVideo: false // Hmm!!
		}
	}

	this.addCandidate = function(candidate){
		this.pc.addIceCandidate(new RTCIceCandidate(candidate))
	}

	this.acceptAnswer = function(desc){
		this.pc.setRemoteDescription(new RTCSessionDescription(desc))
	}

	this.send = function(msg){
		if(!this.open){
			if(!this.queue) this.queue = []
			this.queue.push(msg)
		}
		else this.channel.send(msg)
	}

	// hooks
	this.atOffer = function(){
	}
	
	this.atAnswer = function(){
	}

	this.atIceCandidate = function(){
	}

	this.atOpen = function(){
	}

	this.atClose = function(){
		console.log('webRTC onClose')
	}
	this.atError = function(){
		console.log('webRTC on Error')
	}
	this.atMessage = function(){
	}

	this.setChannel = function(channel){
		this.channel = channel
		channel.onmessage = function(event){
			this.atMessage(event.data, event.timeStamp)
		}.bind(this)
		channel.onopen = function(){
			this.open = true
			this.atOpen.apply(this, arguments)
		}.bind(this)
		channel.onclose = function(){
			this.open = false
			this.atClose.apply(this, arguments)
		}.bind(this)
		channel.onerror = function(){
			this.atError.apply(this, arguments)
		}.bind(this)
	}

	this.acceptOffer = function(offer){
		this.pc.acceptOffer(offer)
	}
})