// Licensed under the Apache License, Version 2.0, see LICENSE.md
// Acorn Serializer

define.class(function(require, exports, self){

	// entrypoint for the serializer
	self.walk = function(node, parent, state){
		if(!(node.type in this)) throw new Error('Dont have '+node.type + ' in AST serialize')
		return this[node.type](node, parent, state)
	}

	self.statements = function(array, parent, state){
		var out = ''
		for(var i = 0; i < array.length; i++){
			var node = array[i]
			out += this[node.type](node, parent, state) 
		}
		return out
	}

	self.list = function(array, parent, state){
		var out = ''
		for(var i = 0;i < array.length; i++){
			var node = array[i]
			if(out)  out += ', '
			out += this[node.type](node, parent, state)
		}
		return out
	}

	self.Program = function(node, parent, state){
		return this.statements(node.body, node, state)
	}

	self.BinaryExpression = function(node, parent, state){
		return this.walk(node.left, node, state) + node.operator + this.walk(node.right, node, state)
	}

	self.AssignmentExpression = function(node, parent, state){
		return this.walk(node.left, node, state) + "=" + this.walk(node.right, node, state)
	}

	self.ExpressionStatement = function(node, parent, state){
		return this.walk(node.expression, node, state)
	}

	self.ThisExpression = function(){
		return 'this'
	}

	self.MemberExpression = function(node, parent, state){
		if(node.computed) return this.walk(node.object, node, state) + '[' + this.walk(node.property, node, state) + ']'
		return this.walk(node.object, node, state) + '.' + node.property.name
	}

	self.CallExpression = function(node, parent, state){
		return this.walk(node.callee, node, state) + '(' + this.list(node.arguments, node, state) + ')'
	}

	self.Identifier = function(node, parent, state){
		return node.name
	}
	
	self.Literal = function(node, parent, state){
		return node.raw
	}	
})
