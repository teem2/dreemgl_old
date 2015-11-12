// Licensed under the Apache License, Version 2.0, see LICENSE.md

define.class(function(node, require){
	var RpcProxy = require('$rpc/rpcproxy')

	this.createRpcProxy = function(parent){
		return RpcProxy.createChildSet(this, parent)
	}
})