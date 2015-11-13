define.class(function (view, codeviewer, text, guide$movie, cells, scrollcontainer) {

    this.slidetitle = "Web Service via Server Proxy";

    this.attribute('movies', {type: Array});
    this.attribute('searchCode', {type: String});
    this.attribute('compositionCode', {type: String});

    this.render = function render() {
        return [
            view({flexdirection: 'row', flex: 1},
                view({flexdirection: 'column', flex: 1, alignself: 'stretch', margin: vec4(10), padding: vec4(4), clipping:true},
                    text({height:30, flex: 0, fontsize:14, alignself: 'stretch', text:'DreemGL Server (./compositions/guide/search.js)'}),
                    scrollcontainer({hscrollvisible:false}, codeviewer({flex: 1, alignself: 'stretch', code: this.searchCode, fontsize: 14, bgcolor: "#000030", multiline: true})),
                    text({height:30, flex: 0, fontsize:14, alignself: 'stretch', text:'DreemGL Client (./compositions/extdemo/index.js)'}),
                    scrollcontainer({hscrollvisible:false}, codeviewer({flex: 1, alignself: 'stretch', code: this.compositionCode, fontsize: 11, bgcolor: "#000030", multiline: false}))
                ),
                cells({flex: 1, padding: 4, margin: 10, cornerradius: 0, bgcolor:"#B3B3D7", clipping:true, data:this.movies, celltype:guide$movie})
            )
        ];
    }


});