define(function(require){
	var fs = require('fs')
	var parser = require('$parsers/htmlparser')

	var xml = parser(fs.readFileSync('../dreem2/compositions/demo/tvdemo.dre'))
	console.log(xml.child)
	fs.writeFileSync('./dump.dre', parser.reserialize(xml))
})