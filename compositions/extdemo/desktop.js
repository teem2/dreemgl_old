/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function(screen, slideviewer, this$slides$intro, this$slides$internal, this$slides$external, this$slides$api) {

    this.attribute('syntaxCode', {type: String});

    this.attribute('movies', {type: Array});
    this.attribute('compositionCode', {type: String});
    this.attribute('searchCode', {type: String});

    this.attribute('devices', {type: Object});
    this.attribute('apiCode', {type: String});

    this.render = function render() {

        return [
            slideviewer(
                {name: 'slides', slideheight: 800, position: 'absolute', x: 0, bgcolor: 'black'},
                this$slides$intro({flex:1, bgcolor:'transparent', syntaxCode:this.syntaxCode}),
                this$slides$internal({flex: 1, movies:this.movies, searchCode:this.searchCode, compositionCode:this.compositionCode}),
                this$slides$external({flex: 1, apiCode:this.apiCode, devices:this.devices}),
                this$slides$api({flex: 1})
            )
        ]
    }
});