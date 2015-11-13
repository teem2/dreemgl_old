/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

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