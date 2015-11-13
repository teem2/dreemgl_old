define.class(function(server, require) {

    // Base API URL
    this.api = "http://www.omdbapi.com/?s=";

    // The string to search for in the OMDB database
    this.attribute("keyword", {type:String});

    // List of movie objects returned from server
    this.attribute("results", {type:Array});

    this.onkeyword = function (key) {

        // request lib used by nodejs to fetch data
        // if not found try to run the following:
        // `cd ./compositions/guide/ && npm install`
        var request = require('request');

        if (key && request) {
            var regx = /[^a-z0-9_-]/ig
            var url = this.api + key.replace(regx, '+');
            request(url,(function (err, resp, body) {
                if (!err && resp.statusCode == 200) {
                    var res = JSON.parse(body);
                    this.results = res["Search"];
                }
            }).bind(this))
        }
    };

});