define.class(function (view, label) {

    this.flexdirection = 'column';
    this.padding = 10;
    this.margin = 10;
    this.borderwidth = 2;
    this.bordercolor = vec4(0.3,0.3,0.3,0.3)

    this.attributes = {
        Title: {type:String},
        Year: {type:String},
        imdbID: {type:String},
        Type: {type:String},
        Poster: {type:String}
    };

    this.onPoster = function (p) {
        this.bgimage = p;
    };

    this.render = function() { return [
        label({
            name:"label",
            text:this.Title + " (" + this.Year + ")",
            fgcolor:'white',
            bgcolor:vec4(0,0,0,0.5),
            multiline: true
        })
    ] }

});