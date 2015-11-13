/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/
// Dali client, autostarts a dali UI process with new JS files

define.class(function(require, exports, self){

	var http = require('http')
	var url = require('url')
	var fs = require('fs')
	var child_process = require('child_process')
	var NodeWebSocket = require('$server/nodewebsocket')

	// lets monitor all our dependencies and terminate if they change
	self.atConstructor(args){
		this.args = args
		this.host = args['-dali'] === true? 'http://127.0.0.1:8080/uitest/dali': args['-dali']
		this.url = url.parse(this.host)
		console.log("DaliClient connecting to " + this.host)
		this.reconnect()
	}

	// connect to server
	self.redownload = function(){
		// lets fetch the main thing
		http.get({
			host: this.url.hostname,
			port: this.url.port,
			path: this.url.path
		}, 
		function(res){
			var data = ''
			res.on('data', function(buf){ data += buf })
			res.on('end', function(){
				// write it and restart it.
				try{
					fs.writeFileSync('./dali.js', data)
					if(this.child){
						var kill = this.child
						this.child = undefined
						var i = 0;
						var itv = this.setInterval(function(){
							try{kill.kill('SIGTERM')}
							catch(e){}
							if(i++ > 20) this.clearInterval(itv) 
						},10)
					}
					this.child = child_process.spawn('./scriptrunner.example', ['./dali.js'])
					this.child.on('close', function(code){
						this.child = undefined
					}.bind(this))		
					this.child.on('error', function(){

					})
				}
				catch(e){
					//console.log(e)
				}
			}.bind(this))
		}.bind(this))
	}

	self.reconnect = function(){
		// put up websocket.
		if(this.sock) this.sock.close()

		this.sock = new NodeWebSocket(this.host)
		this.sock.onError = function(msg){
			setTimeout(function(){
				this.reconnect()
			}.bind(this), 500)
		}.bind(this)

		this.sock.onMessage = function(msg){
			try{
				msg = JSON.parse(msg)
			}
			catch(e){
			}
			if(msg.type == "sessionCheck"){
				this.redownload()
			}
		}.bind(this)

		this.sock.onClose = function(){
			setTimeout(function(){
				this.reconnect()
			}.bind(this), 500)
		}.bind(this)
	}
})