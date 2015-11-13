define.class(function(composition, require, screens, desktop, devices, guide$search, syntax, this$index){

	function getSource(obj) {
		return obj.module.factory.body.toString();
	}

	this.render = function render() {

		return [
			// `compositions/guide/search.js` is used here
			guide$search({name:'search', keyword:"Cats"}),
			screens(
				desktop({
					name:'desktop',
					syntaxCode:getSource(syntax),

					compositionCode:getSource(this$index),
					searchCode:getSource(guide$search),
					movies:'${this.rpc.search.results}',

					apiCode:getSource(devices),
					devices:'${this.rpc.devbus.active}'
				})
		    ),
			devices({name:'devbus'})
		]
	}
});