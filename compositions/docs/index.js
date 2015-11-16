//Pure JS based composition
define.class(function(composition, docviewer, fileio, screens, screen, dataset, splitcontainer, treeview, view, label, require, scrollcontainer){

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
						return
						this.model = filetree.dataset = dataset(tree)
					}.bind(this))
					
				},
				render:function(){
					if (this.locationhash && this.locationhash.path){
						require.async(this.locationhash.path).then(function(module){
						this.find('docviewer').model = module		
					}.bind(this))
					}
					return [
						splitcontainer({ vertical: false, position: "relative", flexdirection: "row", bgcolor: "black", alignitems:"stretch", alignself: "stretch" , flex:1}
							,view({flexdirection:"column", padding: 0,flex: 0.2}
								/*,view({alignitems:"center", bgcolor:"#e0e0e0", flexdirection:"row" ,padding: 14},
									label({text:"DreemGL", fgcolor:"black", bgcolor:"transparent", fontsize: 30 })
								)
								,scrollcontainer({hscrollvisible:false,flex:1},
									view({flex:1, flexdirection:"column"}
										,treeview({
											init:function(){
												var dataset = this.find('screen').model
												if(dataset) this.dataset = dataset
											},
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
								)*/
							)
							,view({flex:1,bgcolor:'red'}
								//,scrollcontainer({hscrollvisible:false, move_view_bgcolor: "#f0f0f0"}
							//		,docviewer({model: ""})
						//		)
							)
						)
					]
				}
			})
		)
	]}
})