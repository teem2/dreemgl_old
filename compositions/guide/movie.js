define.class(function (view, text) {

    this.flexdirection = 'column';
    this.padding = 10;
    this.margin = 10;
    this.borderwidth = 2;
    this.bordercolor = vec4(0.3,0.3,0.3,0.3)

    this.attribute("Title", {type:String});
    this.attribute("Year", {type:String});
    this.attribute("imdbID", {type:String});
    this.attribute("Type", {type:String});
    this.attribute("Poster", {type:String});

    this.onPoster = function (p) {
        this.bgimage = p;
    };

    this.render = function() { return [
        text({
            name:"label",
            text:this.Title + " (" + this.Year + ")",
            fgcolor:'white',
            bgcolor:vec4(0,0,0,0.5),
            multiline: true
        })
    ] }

});