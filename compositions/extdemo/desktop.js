define.class(function(screen, slideviewer, this$slides$intro, this$slides$internal, this$slides$external) {

    this.attributes = {
        syntaxCode: {type: String},
        movies: {type: Array},
        searchCode: {type: String},
        devices: {type: Object},
        apiCode: {type: String}
    };

    this.render = function render() {

        return [
            slideviewer(
                {name: 'slides', slideheight: 800, position: 'absolute', x: 0, bgcolor: 'black'},
                this$slides$intro({flex:1, bgcolor:'transparent', syntaxCode:this.syntaxCode}),
                this$slides$internal({flex: 1, movies:this.movies, searchCode:this.searchCode}),
                this$slides$external({flex: 1, apiCode:this.apiCode, devices:this.devices})
            )
        ]
    }
});