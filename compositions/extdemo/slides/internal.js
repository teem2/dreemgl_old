define.class(function (view, codeviewer, guide$movie, cells) {

    this.slidetitle = "Web Service via Server Proxy";

    this.attribute('movies', {type: Array});
    this.attribute('searchCode', {type: String});

    this.render = function render() {
        return [
            view({flexdirection: 'row', flex: 1},
              codeviewer({flex: 1, alignself: 'stretch', margin: vec4(10), code: this.searchCode, padding: vec4(4), fontsize: 14, bgcolor: "#000030", multiline: true}),
              cells({flex: 1, padding: 4, margin: 10, cornerradius: 0, bgcolor:"#B3B3D7", clipping:true, data:this.movies, celltype:guide$movie})
            )
        ];
    }


});