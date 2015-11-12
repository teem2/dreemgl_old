define.class(function(composition, require, screens, desktop, devices, guide$search, syntax){

	this.render = function render() {

		return [
			screens(
				desktop({
					name:'desktop',
					syntaxCode:syntax.module.factory.body.toString(),

					searchCode:guide$search.module.factory.body.toString(),
					movies:'${this.rpc.search.results}',

					apiCode:devices.module.factory.body.toString(),
					devices:'${this.rpc.devbus.active}'
				})
		    ),
			guide$search({name:'search', keyword:"Cats"}),
			devices({name:'devbus'})
		]
	}
});