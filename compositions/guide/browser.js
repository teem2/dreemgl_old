define.class(function(screen, view, button, editor, text, this$movie) {

    this.attribute('term', {type:String});
    this.attribute('movies', {type:Array});

    this.renderMovies = function() {
        var mviews = [];

        if (this.movies) {
            for (var i=0;i<this.movies.length;i++) {
                var movieData = this.movies[i];
                mviews.push(this$movie(movieData));
            }
        }
        return mviews;
    };

    this.render = function() { return [

        view(
            {flexdirection:'column'},
            text({ name:'search', width:300, height:30, text:'Aliens'}),
            button({text:'Search', width:90, click:function() {
                // sets the term on our screen, this should fire the server thing
                this.screen.term = this.parent.search.text;
            }}),
            view(this.renderMovies())
        )
    ] }

});