define.class(function(server, require) {

    // Base API URL
    this.apiurl = "http://www.omdbapi.com/?s=";

    // The string to search for in the OMDB database
    this.attribute("keyword", {type:String});

    // List of movie objects returned from server
    this.attribute("results", {type:Array});

    this.onkeyword = function (key) {

        // request library used by nodejs to fetch data
        // if not found try to run the following command:
        // `cd ./compositions/guide/ && npm install`
        var request = require('request');

        if (key && request) {
            var regx = /[^a-z0-9_-]/ig
            var url = this.apiurl + key.replace(regx, '+');
            request(url,(function (error, resp, body) {
                if (!error && resp.statusCode == 200) {
                    var res = JSON.parse(body);
                    this.results = res["Search"];
                }
            }).bind(this))
        }
    };

});