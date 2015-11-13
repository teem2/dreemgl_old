define.class(function(screen, slideviewer, this$slides$intro, this$slides$internal, this$slides$external) {

    this.attribute('syntaxCode', {type: String});

    this.attribute('movies', {type: Array});
    this.attribute('compositionCode', {type: String});
    this.attribute('searchCode', {type: String});

    this.attribute('devices', {type: Object});
    this.attribute('apiCode', {type: String});

    this.render = function render() {

        return [
            slideviewer(
                {name: 'slides', slideheight: 800, position: 'absolute', x: 0, bgcolor: 'black'},
                this$slides$intro({flex:1, bgcolor:'transparent', syntaxCode:this.syntaxCode}),
                this$slides$internal({flex: 1, movies:this.movies, searchCode:this.searchCode, compositionCode:this.compositionCode}),
                this$slides$external({flex: 1, apiCode:this.apiCode, devices:this.devices})
            )
        ]
    }
});