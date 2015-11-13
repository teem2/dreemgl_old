/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function (view, text) {

    this.bgcolor = 'transparent';
    this.flexdirection = 'row';
    this.padding = 10;
    this.margin = 10;

    this.attribute("deviceId", {type:String});
    this.attribute("deviceType", {type:String});

    this.render = function() {
        return [
          view({width:this.width, height:'${this.parent.height - this.parent.txt.height}', bgimage:'$compositions/extdemo/slides/' + this.deviceType + '.png'}),
          text({name:'txt', text:this.deviceId, fontsize:14, fgcolor:'white', align:'center', multiline: false})
        ]
    }

});