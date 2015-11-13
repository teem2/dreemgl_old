/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function (view, text) {

    this.slidetitle = "Attributes via POST API";

    this.attribute('setterCode', {type: String, value:
    'uri = URI.parse("http://localhost:2000/extdemo")\n' +
    '\n' +
    'Net::HTTP.start(uri.hostname, uri.port) do |http|\n' +
    '\n' +
    '  (req = Net::HTTP::Post.new(uri)).body = {\n' +
    '    rpcid: "search",\n' +
    '    type: "attribute",\n' +
    '    attribute: "keyword",\n' +
    '    value: "Monkey"\n' +
    '  }.to_json\n' +
    '\n' +
    '  puts "sending JSON: #{req.body}"\n' +
    '  http.request(req)\n' +
    '\n' +
    'end'});

    this.attribute('getterCode', {type: String, value:
    'uri = URI.parse("http://localhost:2000/extdemo")\n' +
    '\n' +
    'Net::HTTP.start(uri.hostname, uri.port) do |http|\n' +
    '\n' +
    '  (req = Net::HTTP::Post.new(uri)).body = {\n' +
    '    rpcid: "search",\n' +
    '    type: "attribute",\n' +
    '    attribute: "keyword",\n' +
    '    get: true\n' +
    '  }.to_json\n' +
    '\n' +
    '  puts "sending JSON: #{req.body}"\n' +
    '  res = http.request(req)\n' +
    '  puts "response JSON: #{res.body}"\n' +
    '\n' +
    'end'});

    this.flexdirection = 'column';

    this.render = function render() {
        return [
            view({flexdirection: 'row', flex: 1},
                view(
                    {flexdirection: 'column', flex: 1, alignself: 'stretch', margin: vec4(10), padding: vec4(4), clipping:true},
                    text({height:30, fontsize:14, flex: 0, alignself: 'stretch', text:'Set Attribute via API (Ruby Example)'}),
                    text({ flex: 1, alignself: 'stretch', text: this.setterCode, fontsize: 14, fgcolor:'aqua', bgcolor: "#000030", multiline: false})
                ),
                view(
                    {flexdirection: 'column', flex: 1, alignself: 'stretch', margin: vec4(10), padding: vec4(4), clipping:true},
                    text({height:30, fontsize:14, flex: 0, alignself: 'stretch', text:'Get Attribute via API (Ruby Example)'}),
                    text({ flex: 1, alignself: 'stretch', text: this.getterCode, fontsize: 14, fgcolor:'pink', bgcolor: "#000030", multiline: false})
                )
            ),
            view(
                {flexdirection: 'column', flex: 0, alignself: 'stretch', padding:10},
                text({fontsize:28, text:'The current value of "search.keyword" is: ' + this.rpc.search.keyword, alignself: 'center'})
            )
        ];
    }
});