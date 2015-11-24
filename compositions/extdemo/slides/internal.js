/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function (view, codeviewer, label, guide$movie, cells) {

    this.attributes = {
        movies: {type: Array},
        searchCode: {type: String},
        compositionCode: {type: String}
    };

    this.slidetitle = "Web Service via Server Proxy";
    this.bgcolor = 'transparent';
    this.flexdirection = 'column'

    this.render = function render() {
        return [
            label({marginleft:15, fgcolor:'red', text:'Proxy through server when everything can be handeled entirely via nodejs!'}),
            view({flexdirection: 'row', flex: 1, bgcolor:'transparent'},
                view({flexdirection: 'column', flex: 1, alignself: 'stretch', margin: vec4(10), padding: vec4(4), clipping:true, bgcolor:'transparent'},
                    label({height:30, flex: 0, fontsize:14, alignself: 'stretch', text:'DreemGL Server (./compositions/guide/search.js)'}),
                    codeviewer({flex: 1, alignself: 'stretch', code: this.searchCode, fontsize: 14, bgcolor: "#000030", multiline: true}),
                    label({height:30, flex: 0, fontsize:14, alignself: 'stretch', text:'DreemGL Client (./compositions/extdemo/index.js)'}),
                    codeviewer({flex: 1, alignself: 'stretch', code: this.compositionCode, fontsize: 11, bgcolor: "#000030", multiline: false})
                ),
                cells({flex: 1, padding: 4, margin: 10, cornerradius: 0, bgcolor:"#B3B3D7", clipping:true, data:this.movies, celltype:guide$movie})
            )
        ];
    }


});