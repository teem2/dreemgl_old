define.class(function(server, require) {

    // Base API URL
    this.apiurl = "http://www.omdbapi.com/?s=";

    // request library used by nodejs to fetch the URL
    // If not found try to run the following command:
    // `cd ./compositions/guide/ && npm install`
    this.request = require('request');

    // The string to search for in the OMDB database
    this.attribute("keyword", {type:String});

    // List of movie objects returned from server
    this.attribute("results", {type:Array});

    this.onkeyword = function (keyword) {
        if (keyword && this.request) {
            this.request(this.apiurl + keyword.replace(/[^a-z0-9_-]/ig, '+'), (function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var res = JSON.parse(body);
                    this.results = res["Search"];
                }
            }).bind(this))
        }
    };

});