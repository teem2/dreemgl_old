//Pure JS based composition
define.class(function(composition, docviewer, codeviewer, fileio, screens, screen, dataset, splitcontainer, treeview, view, label, require){

	this.render = function(){
		return [
		fileio(),
		screens(
			screen({
				init:function(){
					// lets load the entire directory structure
					this.rpc.fileio.readalldir('',['fonts','build','lib','server.js','favicon.ico','define.js','textures','gzcache','@/\\.','.git', '.gitignore']).then(function(result){
						var filetree = this.find('filetree')
						var tree = result.value
						tree.name = 'Documentation'
						tree.collapsed = false
						// lets make a dataset
						this.model = filetree.dataset = dataset(tree)
					}.bind(this))
					
				},
				render:function(){
					//console.log('hi!')
					//if( Error().stack.split(/\n/)[2].match(/index\.js\?b/)) debugger
					if (this.locationhash && this.locationhash.path){
						require.async(this.locationhash.path).then(function(module){
							this.find('codeviewer').model = module.body.toString()
						}.bind(this))
					}
					return [
						splitcontainer({ vertical: false,  bgcolor: "black", flex:1}
							,view({flexdirection:"column", padding: 0,flex: 0.2}
								,view({alignitems:"center", bgcolor:"#e0e0e0", flexdirection:"row" ,padding: 14},
									label({text:"DreemGL", fgcolor:"black", bgcolor:"#e0e0e0", fontsize: 35 })
								)
								,treeview({
									postLayout:function(){
									},
									init:function(){
										window.test = this
										var dataset = this.find('screen').model
										if(dataset) this.dataset = dataset
									},
									
									//blend:{
									//	color:function(){
									//		return texture.sample(mesh.xy + 0.1*noise.noise3d(mesh.xyy))
									//	}
									//},
									name:'filetree', 
									flex:1, 
									selectclick:function(sel){
										// we have to grab the last path set and concatenate a path
										var path = ''
										for(var i = sel.path.length - 1; i >= 1; i--){
											path = sel.path[i].name + (path!==''?'/' + path:'')
										}
										this.find('screen').locationhash = {path : '$root/'+path};
									}
								})
							)
							,codeviewer({mode:'2D', overflow:'scroll', bgcolor:'black', flex:1})
						)
					]
				}
			})
		)
	]}
})