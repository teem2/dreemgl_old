/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

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