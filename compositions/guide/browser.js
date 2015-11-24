define.class(function(screen, view, button, editor, label, this$movie) {

    this.attributes = {
        term: {type:String},
        movies: {type:Array}
    };

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
            label({ name:'search', width:300, height:30, text:'Aliens'}),
            button({text:'Search', width:90, click:function() {
                // sets the term on our screen, this should fire the server thing
                this.screen.term = this.parent.search.text;
            }}),
            view(this.renderMovies())
        )
    ] }

});