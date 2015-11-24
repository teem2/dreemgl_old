define.class(function (view, codeviewer, cells, device) {

    this.slidetitle = "External Device via POST API";

    this.attributes = {
        deviceList: {type: Array},
        devices: {type: Object}
    };

    this.ondevices = function (devices) {
        var deviceList = [];
        for (var d in devices) {
            if (devices.hasOwnProperty(d)) {
                deviceList.push({ deviceId: d, deviceType: devices[d] })
            }
        }
        this.deviceList = deviceList;
    };

    this.attributes = {apiCode: {type: String}};

    this.render = function render() {
        return [
            view({flexdirection: 'row', flex: 1},
              codeviewer({ flex: 1, alignself: 'stretch', margin: vec4(10), code: this.apiCode, padding: vec4(4), fontsize: 14, bgcolor: "#000030", multiline: true}),
              cells({flex: 1, padding: 4, margin: 10, cornerradius: 0, bgcolor: '#D1CAB0', cellwidth:80, cellheight:80, data:this.deviceList, celltype:device})
            )
        ];
    }


});