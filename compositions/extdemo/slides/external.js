/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function (view, text, codeviewer, cells, device) {

    this.slidetitle = "External Devices via POST API";

    this.attribute('deviceList', {type: Array});
    this.attribute('devices', {type: Object});

    this.ondevices = function (devices) {
        var deviceList = [];
        for (var d in devices) {
            if (devices.hasOwnProperty(d)) {
                deviceList.push({ deviceId: d, deviceType: devices[d] })
            }
        }
        this.deviceList = deviceList;
    };

    this.attribute('apiCode', {type: String});
    this.attribute('clientCode', {type: String, value:
      'uri = URI.parse("http://localhost:2000/extdemo")\n' +
      '\n' +
      'Net::HTTP.start(uri.hostname, uri.port) do |http|\n' +
      '\n' +
      '  (req = Net::HTTP::Post.new(uri)).body = {\n' +
      '    rpcid: "devbus",\n' +
      '    type: "method",\n' +
      '    method: "notify",\n' +
      '    args: ["deviceID","deviceType","<join/part>"]\n' +
      '  }.to_json\n' +
      '\n' +
      '  puts "sending JSON: #{req.body}"\n' +
      '  http.request(req)\n' +
      '\n' +
      'end'});

    this.render = function render() {
        return [
            view({flexdirection: 'row', flex: 1},
                view(
                    {flexdirection: 'column', flex: 1, alignself: 'stretch', margin: vec4(10), padding: vec4(4), clipping:true},
                    text({height:30, fontsize:14, flex: 0, alignself: 'stretch', text:'DreemGL Server (./compositions/extdemo/devices.js)'}),
                    codeviewer({ flex: 1, alignself: 'stretch', code: this.apiCode, fotsize: 14, bgcolor: "#000030", multiline: true}),
                    text({height:30, flex: 0, alignself: 'stretch', text:'Method call via API (Ruby Example)'}),
                    text({ flex: 1, alignself: 'stretch', text: this.clientCode, fontsize: 14, fgcolor:'yellow', bgcolor: "#000030", multiline: false})
                ),
                view(
                    {flexdirection: 'column', flex: 1, alignself: 'stretch', clipping:true, padding: 4, margin: 10},
                    text({height:30, flex: 0, alignself: 'stretch', text:'Active Devices'}),
                    text({fontsize:10, height:30, flex: 0, alignself: 'stretch', text:'(run ./compositions/extdemo/bin/createdevices.rb to simulate device activity)'}),
                    cells({flex: 1, bgcolor: '#D1CAB0', cellwidth:80, cellheight:80, data:this.deviceList, celltype:device, cornerradius: 0})
                )
            )
        ];
    }
});