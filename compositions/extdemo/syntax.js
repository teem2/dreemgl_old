define.class(function (view, guide$movie, this$slides$device) {

    // `guide$movie` is loading the view found in `./compositions/guide/movie.js`

    // The `this` prefix refers to the current component, regardless of the directory name
    // so `this$slides$device` maps to `./compositions/<this>/slides/device.js`
    // (which in this case is, `./compositions/extdemo/slides/device.js`)

    this.attribute('movieData', {type:Object});
    this.attribute('deviceData', {type:Object, value:{ deviceId:'TK-429', deviceType:'syntax' }});

    this.render = function() {
        // Use the component classes just as you would any normal DreemGL class function.
        return [ guide$movie(this.movieData), this$slides$device(this.deviceData) ]
    }

});