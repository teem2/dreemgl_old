define.class(function (view, text, codeviewer, cells, device) {

    this.slidetitle = "External Device via POST API";

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
                  text({height:30, flex: 0, alignself: 'stretch', text:'DreemGL Server'}),
                  codeviewer({ flex: 1, alignself: 'stretch', code: this.apiCode, fotsize: 14, bgcolor: "#000030", multiline: true}),
                  text({height:30, flex: 0, alignself: 'stretch', text:'External API Client'}),
                  text({ flex: 1, alignself: 'stretch', text: this.clientCode, fontsize: 14, fgcolor:'yellow', bgcolor: "#000030", multiline: false})
              ),
              cells({flex: 1, padding: 4, margin: 10, cornerradius: 0, bgcolor: '#D1CAB0', cellwidth:80, cellheight:80, data:this.deviceList, celltype:device})
            )
        ];
    }
});