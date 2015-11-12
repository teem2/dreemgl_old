define.class(function(composition, screens, this$search, this$browser) {

    this.render = function() { return [
        this$search({
            name:'omdb',
            keyword:'${this.rpc.screens.main.term}'
        }),
        screens(
            this$browser({
                name:'main',
                term:'Aliens',
                movies:'${this.rpc.omdb.results}'
            })
        )
    ] }
});
