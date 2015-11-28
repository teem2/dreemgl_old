//Pure JS based composition
define.class(function(composition, docviewer, codeviewer, fileio, screens, screen, dataset, splitcontainer, treeview, view, label, require){

	this.render = function(){
		return [
		fileio(),
		screens(
			screen({
				init:function(){
					require.async('$classes/button.js')
					// lets load the entire directory structure
					this.rpc.fileio.readalldir('',['fonts','build','lib','server.js','favicon.ico','define.js','textures','cache','@/\\.','.git', '.gitignore']).then(function(result){
						var filetree = this.find('filetree')
						var tree = result.value
						tree.name = 'Documentation'
						tree.collapsed = false
						// lets make a dataset
						this.model = filetree.dataset = dataset(tree)
					}.bind(this))
					
				}},
				splitcontainer({vertical: false,  bgcolor: "black", flex:1}
					,view({flexdirection:"column", padding: 0,flex: 0.2}
						,view({alignitems:"center", bgcolor:"#e0e0e0", flexdirection:"row" ,padding: 14},
							label({text:"DreemGL", fgcolor:"black", bgcolor:"#e0e0e0", fontsize: 35 })
						)
						,treeview({
							postLayout:function(){
							},
							init:function(){
								var dataset = this.find('screen').model
								if(dataset) this.dataset = dataset
							},

							name:'filetree', 
							flex:1, 
							select:function(sel){
								if(sel.type === 'setter')debugger
								// we have to grab the last path set and concatenate a path
								var path = ''
								for(var i = sel.path.length - 1; i >= 1; i--){
									path = sel.path[i].name + (path!==''?'/' + path:'')
								}
								this.find('screen').locationhash = {path : '$root/'+path};
							}
						})
					)
					,docviewer({flex:1,
						attributes:{class:{persist:true}},
						init:function(){
							//console.log("INITIALIZIN")
							this.screen.locationhash = function(event){
							//	debugger

								if(event.value.path) require.async(event.value.path).then(function(module){
									this.class = module
								}.bind(this))
							}.bind(this)
							//this.screen.locationhash = this.screen.locationhash
						},
						minsize:vec2(400,400),
						overflow:'scroll'
					//	overflow:'scroll'
					})
				)
			)
		)
	]}
})