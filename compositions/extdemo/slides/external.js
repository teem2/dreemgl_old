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
      'uri=URI.parse("http://localhost:2000/extdemo");\n\n' +
      'Net::HTTP.start(uri.hostname, uri.port) { |http|\n' +
      '  req = Net::HTTP::Post.new(uri)\n' +
      '  req.body = { \nrpcid:"devbus",\ntype:"method",\nmethod:"notify",\nargs:["id","type","join/part"],\n   }.to_json\n' +
      '\n  http.request(req)\n' +
      '}'});

    this.render = function render() {
        return [
            view({flexdirection: 'row', flex: 1},
              view(
                  {flexdirection: 'column', flex: 1, alignself: 'stretch', margin: vec4(10), padding: vec4(4)},
                  text({height:30, flex: 0, alignself: 'stretch', text:'DreemGL Server'}),
                  codeviewer({ flex: 1, alignself: 'stretch', code: this.apiCode, fotsize: 14, bgcolor: "#000030", multiline: true}),
                  text({height:30, flex: 0, alignself: 'stretch', text:'External API Client'}),
                  text({ flex: 1, alignself: 'stretch', text: this.clientCode, fontsize: 14, fgcolor:'yellow', bgcolor: "#000030", multiline: true})
              ),
              cells({flex: 1, padding: 4, margin: 10, cornerradius: 0, bgcolor: '#D1CAB0', cellwidth:80, cellheight:80, data:this.deviceList, celltype:device})
            )
        ];
    }


});