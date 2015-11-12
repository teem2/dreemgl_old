// Licensed under the Apache License, Version 2.0, see LICENSE.md
// BusServer class, a package of websockets you can broadcast on (server side)

define.class(function(require, exports, self){

	self.atConstructor = function(){
		this.sockets = []
	}

	// adds a WebSocket to the BusServer
	self.addWebSocket = function(sock){
		this.sockets.push(sock)

		sock.atEnd = function(){
			this.sockets.splice(this.sockets.indexOf(sock), 1)
			sock.onEnd = undefined
		}.bind(this)

		sock.atMessage = function(message){
			this.atMessage(JSON.parse(message), sock)
		}.bind(this)

		this.atConnect(sock)
	}

	// called when a new message arrives
	self.atMessage = function(message, socket){
	} 

	// Called when a new socket appears on the bus
	self.atConnect = function(message, socket){
	}

    // Send a message to all connected sockets
	self.broadcast = function(message, ignore){
		message = JSON.stringify(message)
		for(var i = 0;i<this.sockets.length;i++){
			var socket = this.sockets[i]
			if(socket !== ignore) socket.send(message)
		}
	}

	// close all sockets
	self.closeAll = function(){
		for(var i = 0; i < this.sockets.length; i++){
			this.sockets[i].close()
		}
		this.sockets = []
	}
})