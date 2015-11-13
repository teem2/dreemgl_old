/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function (view, text, codeviewer) {

    this.slidetitle = "External Components in DreemGL";

    this.flexdirection = 'column';
    this.attribute('syntaxCode', {type: String});
    this.bgcolor = 'transparent';

    this.render = function render() {
        return [
            text({
                text:'+ Components are just directories - No special work required!',
                fgcolor:'#333',
                fontsize:25,
                margintop:30
            }),
            text({
                text:'(note: define.$plugins defaults to $compositions directory for convenience, but can be changed for security)',
                fgcolor:'#666',
                fontsize:14,
                margintop:5,
                marginleft:25
            }),
            text({
                text:'+ Compositions can auto load classes from component directories',
                fgcolor:'#333',
                fontsize:25,
                margintop:15
            }),
            text({
                text:'Use the `componentname$classname` syntax:',
                fgcolor:'#444',
                fontsize:20,
                margintop:5,
                marginleft:95
            }),
            codeviewer({
                flex: 0,
                alignself: 'center',
                margin: vec4(10),
                code: this.syntaxCode,
                padding: vec4(4),
                fontsize: 14,
                bgcolor: "#000030",
                multiline: true}
            ),
            text({
                text:'+ Example compositions and docs automatic, no special mounting!',
                fgcolor:'#333',
                fontsize:25,
                margintop:10
            }),
            text({
                text:'(note: see `./compositions/guide/README.md` for more detail)',
                fgcolor:'#666',
                fontsize:14,
                margintop:5,
                marginleft:25
            })

        ];
    };
});